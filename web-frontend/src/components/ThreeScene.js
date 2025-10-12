import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import axiosAuthInstance from "../utils/axios-auth-instance";

Modal.setAppElement('#root');

export default function ThreeScene({ apiResponse }) {
  const mountRef = useRef();
  const cameraRef = useRef();
  const angleRef = useRef(Math.PI);
  const [rotateTrigger, setRotateTrigger] = useState(null);
  const [doLegend, setDoLegend] = useState([]);
  const hoveredLabelRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [useSelectedContainer, setUseSelectedContainer] = useState(false);
  const [isUpdatingTruck, setIsUpdatingTruck] = useState(false);
  const [showFitnessWarningModal, setShowFitnessWarningModal] = useState(false);

  const radius = 250;

  useEffect(() => {
    // Jika user sudah memilih untuk menggunakan selected container, langsung render
    if (useSelectedContainer) {
      renderVisualization();
      return;
    }
  
    // Check if selected container matches base container
    const selectedContainer = apiResponse.data[0].selected_container;
    const baseContainer = apiResponse.data[0].base_container;
    const fitnessScore = apiResponse.data[0].fitness;
    const shipmentNum = apiResponse.data[0].shipment_num;
    
    // Jika fitness score > 2, tampilkan warning modal
    if (fitnessScore > 2) {
      setShowFitnessWarningModal(true);
      return;
    }
    
    if (selectedContainer !== baseContainer) {
      setShowModal(true);
      return;
    }
    
    // Jika sama, render visualization
    renderVisualization();
  }, [apiResponse, useSelectedContainer]);

  const renderVisualization = () => {
    let containerLength, containerWidth, containerHeight;

    const selectedContainer = apiResponse.data[0].selected_container;
    if (selectedContainer === "CDE") {
      containerLength = 350;
      containerWidth = 160;
      containerHeight = 160;
    } else { // BLIND VAN
      containerLength = 255;
      containerWidth = 146;
      containerHeight = 130;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    mountRef.current.appendChild(labelRenderer.domElement);

    camera.position.set(-radius, 150, 0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const boxes = [];
    const doColors = {};
    let selectedBox = null;
    let originalY = null;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(containerLength, containerWidth),
      new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(containerLength, containerWidth);
    scene.add(gridHelper);

    const containerGeom = new THREE.BoxGeometry(containerLength, containerHeight, containerWidth);
    const containerWire = new THREE.EdgesGeometry(containerGeom);
    const containerLine = new THREE.LineSegments(containerWire, new THREE.LineBasicMaterial({ color: 0x000000 }));
    containerLine.position.y = containerHeight / 2;
    scene.add(containerLine);

    const gridYZ = new THREE.GridHelper(containerWidth, 10);
    gridYZ.rotation.z = Math.PI / 2;
    gridYZ.position.set(containerLength / 2, containerHeight / 2, 0);
    scene.add(gridYZ);

    function loadData(apiResponse) {
      const layout = apiResponse.data[0].layout;
      boxes.forEach(box => scene.remove(box));
      boxes.length = 0;
    
      const legendMap = new Map();
    
      layout.forEach(item => {
        const [minX, minY, minZ] = item.min_corner;
        const [maxX, maxY, maxZ] = item.max_corner;
        const width = maxX - minX;
        const height = maxY - minY;
        const depth = maxZ - minZ;
        const geometry = new THREE.BoxGeometry(width, depth, height);
        const doIndex = item.do_index;
    
        if (!doColors[doIndex]) {
          doColors[doIndex] = new THREE.Color(contrastColors[doIndex % contrastColors.length]);
        }
    
        // Tambahkan ke legendMap
        if (!legendMap.has(doIndex)) {
          legendMap.set(doIndex, {
            do_num: item.do_num,
            color: `#${doColors[doIndex].getHexString()}`
          });
        }
    
        const material = new THREE.MeshBasicMaterial({ color: doColors[doIndex], opacity: 0.8, transparent: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x000000 })));
    
        // mesh.position.set(
        //   (containerLength - minX - width) - containerLength / 2 + width / 2,
        //   (minZ + depth / 2),
        //   (minY + height / 2) - containerHeight / 2
        // );
        mesh.position.set(
          containerLength / 2 - (minX + width / 2),
          minZ + depth / 2,
          minY - containerWidth / 2 + height / 2
        );
        scene.add(mesh);
        boxes.push(mesh);
      });
    
      // Update legend state
      setDoLegend(Array.from(legendMap.values()).reverse());
    }
    

    function checkCollision(selected) {
      const selectedBB = new THREE.Box3().setFromObject(selected);
      return boxes.some(box => box !== selected && selectedBB.intersectsBox(new THREE.Box3().setFromObject(box)));
    }

    function getLowestAvailableLevel(selected) {
      let lowestY = 0;
      const selectedBB = new THREE.Box3().setFromObject(selected);
      boxes.forEach(box => {
        if (box === selected) return;
        const boxBB = new THREE.Box3().setFromObject(box);
        const overlap =
          selectedBB.min.x < boxBB.max.x && selectedBB.max.x > boxBB.min.x &&
          selectedBB.min.z < boxBB.max.z && selectedBB.max.z > boxBB.min.z;
        if (overlap) lowestY = Math.max(lowestY, boxBB.max.y);
      });
      return lowestY;
    }

    function getMousePosition(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onMouseMove(event) {
      getMousePosition(event);
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      // Hover: cari intersect dengan box
      const intersects = raycaster.intersectObjects(boxes);
    
      // Hapus label sebelumnya
      if (hoveredLabelRef.current) {
        hoveredLabelRef.current.parent.remove(hoveredLabelRef.current);
        hoveredLabelRef.current = null;
      }
    
      if (intersects.length > 0 && !selectedBox) {
        const box = intersects[0].object;
        const doEntry = doLegend.find(entry => `#${box.material.color.getHexString()}` === entry.color);
        if (doEntry) {
          const labelDiv = document.createElement('div');
          labelDiv.textContent = doEntry.do_num;
          labelDiv.style.padding = '2px 6px';
          labelDiv.style.background = 'rgba(0,0,0,0.7)';
          labelDiv.style.color = 'white';
          labelDiv.style.borderRadius = '4px';
          labelDiv.style.fontSize = '12px';
          labelDiv.style.whiteSpace = 'nowrap';
    
          const label = new CSS2DObject(labelDiv);
          label.position.set(0, 0, 0);
          box.add(label);
          hoveredLabelRef.current = label;
        }
      }
    
      // Jika sedang drag
      if (selectedBox) {
        const intersectFloor = raycaster.intersectObject(floor);
        if (intersectFloor.length > 0) {
          const point = intersectFloor[0].point;
          const minX = -containerLength / 2;
          const maxX = containerLength / 2;
          const minZ = -containerWidth / 2;
          const maxZ = containerWidth / 2;
          const newX = Math.max(minX + selectedBox.geometry.parameters.width / 2, Math.min(maxX - selectedBox.geometry.parameters.width / 2, Math.round(point.x * 10) / 10));
          const newZ = Math.max(minZ + selectedBox.geometry.parameters.depth / 2, Math.min(maxZ - selectedBox.geometry.parameters.depth / 2, Math.round(point.z * 10) / 10));
          selectedBox.position.set(newX, selectedBox.position.y, newZ);
          const targetY = Math.max(getLowestAvailableLevel(selectedBox) + selectedBox.geometry.parameters.height / 2, 0);
          selectedBox.position.y = checkCollision(selectedBox) ? originalY + selectedBox.geometry.parameters.height : targetY;
        }
      }
    }
    

    function onMouseDown(event) {
      getMousePosition(event);
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(boxes);
      if (intersects.length > 0) {
        selectedBox = intersects[0].object;
        originalY = selectedBox.position.y;
      }
    }

    function onMouseUp() {
      selectedBox = null;
      originalY = null;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    loadData(apiResponse);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, cameraRef.current);
      labelRenderer.render(scene, cameraRef.current);
    }
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    
      if (mountRef.current) {
        if (renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        if (labelRenderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(labelRenderer.domElement);
        }
      }
    };
  }

  const handleUseSelectedContainer = async () => {
    try {
      setIsUpdatingTruck(true);
      
      const truckType = apiResponse.data[0].selected_container === "CDE" ? 2 : 1;
      
      const response = await axiosAuthInstance.post(
        `/shipment/${apiResponse.data[0].shipment_id}/update-truck-type`, 
        { typeId: truckType }
      );
      
      setUseSelectedContainer(true);
      setShowModal(false);
      alert(`Truck berhasil diubah ke ${apiResponse.data[0].selected_container}`);
      
    } catch (error) {
      console.error("Failed to update truck:", error);
      
      // Cek apakah error memiliki response dari backend
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Failed to update truck. Please try again.";
      
      alert(`Error: ${errorMessage}`);
      
      // Jika error karena truck tidak tersedia, tetap tutup modal
      if (error.response?.data?.error?.includes("No available truck")) {
        setShowModal(false);
      }
      window.location.href = '/pengiriman';
    } finally {
      setIsUpdatingTruck(false);
    }
  };

  const handleCancel = () => {
    setUseSelectedContainer(false);
    setShowModal(false);
    window.location.href = '/pengiriman';
  };

  const handleFitnessWarningConfirm = () => {
    setShowFitnessWarningModal(false);
    window.location.href = '/pengiriman';
  };

  useEffect(() => {
    if (!rotateTrigger || !cameraRef.current) return;
    const camera = cameraRef.current;
    if (rotateTrigger === 'left') angleRef.current += Math.PI / 8;
    if (rotateTrigger === 'right') angleRef.current -= Math.PI / 8;
    const angle = angleRef.current;

    camera.position.x = radius * Math.cos(angle);
    camera.position.z = radius * Math.sin(angle);
    camera.lookAt(0, 0, 0);
    setRotateTrigger(null);
  }, [rotateTrigger]);

  return (
    <div ref={mountRef} style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Modal untuk fitness warning */}
      {showFitnessWarningModal && (
        <Modal
          isOpen={showFitnessWarningModal}
          onRequestClose={handleFitnessWarningConfirm}
          style={modalStyles}
          contentLabel="Fitness Warning"
        >
          <h2 style={{ marginTop: 0 }}>Peringatan Kapasitas</h2>
          <p>
            Pengiriman tidak dapat divisualisasikan karena tidak muat di semua jenis container yang tersedia.
          </p>
          <p>
            Fitness score: {apiResponse.data[0].fitness.toFixed(2)} (nilai &gt; 2 menunjukkan ketidakcocokan dengan semua container)
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button onClick={handleFitnessWarningConfirm} style={buttonStyle}>
              Ok
            </button>
          </div>
        </Modal>
      )}


      {showModal && (
        <Modal
          isOpen={showModal}
          onRequestClose={handleCancel}
          style={modalStyles}
          contentLabel="Container Mismatch Confirmation"
        >
          <h2 style={{ marginTop: 0 }}>Container Tidak Sesuai</h2>
          <p>
            Barang tidak muat di container default ({apiResponse.data[0].base_container}). 
            Sistem menyarankan menggunakan {apiResponse.data[0].selected_container} dengan fitness score {apiResponse.data[0].fitness.toFixed(2)}.
          </p>
          <p>Apakah Anda ingin menggunakan {apiResponse.data[0].selected_container}?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleCancel} style={{ ...buttonStyle, backgroundColor: '#ccc', color: '#333' }}>
              Kembali
            </button>
            <button onClick={handleUseSelectedContainer} style={buttonStyle} disabled={isUpdatingTruck}>{isUpdatingTruck ? 'Memproses...' : `Gunakan ${apiResponse.data[0].selected_container}`}
            </button>
          </div>
        </Modal>
      )}
      
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'row',
        gap: '12px'
      }}>
        <button onClick={() => window.history.back()} style={buttonStyle}>⬅ Back</button>
        <button onClick={() => setRotateTrigger('left')} style={buttonStyle}>⟲ Rotate Left</button>
        <button onClick={() => setRotateTrigger('right')} style={buttonStyle}>⟳ Rotate Right</button>
      </div>
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <div>
          <strong>Nomor Shipment:</strong> {apiResponse.data[0].shipment_num}
        </div>
        <div>
          <strong>Jenis Truk:</strong> {apiResponse.data[0].selected_container}
        </div>
        <div>
          <strong>Tingkat Utilisasi:</strong> {(apiResponse.data[0].utilization * 100).toFixed(2)}%        
        </div>
        <div>
          <strong>Urutan Pengiriman:</strong>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {doLegend.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: item.color, border: '1px solid #000' }} />
              <span>{idx + 1}. {item.do_num}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const buttonStyle = {
  backgroundColor: '#111',
  color: 'white',
  padding: '8px 14px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
};

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '90%',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
};

const contrastColors = [
  '#e6194b', // Red
  '#3cb44b', // Green
  '#ffe119', // Yellow
  '#4363d8', // Blue
  '#f58231', // Orange
  '#911eb4', // Purple
  '#46f0f0', // Cyan
  '#f032e6', // Magenta
  '#bcf60c', // Lime
  '#fabebe', // Pink
  '#008080', // Teal
  '#e6beff', // Lavender
  '#9a6324', // Brown
  '#fffac8', // Beige
  '#800000', // Maroon
  '#aaffc3', // Mint
  '#808000', // Olive
  '#ffd8b1', // Apricot
  '#000075', // Navy
  '#808080', // Grey
]