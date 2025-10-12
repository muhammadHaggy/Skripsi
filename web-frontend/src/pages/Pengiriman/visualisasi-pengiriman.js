import React, { useState, useEffect } from "react";
import ThreeScene from '../../components/ThreeScene';
import { useParams, useNavigate } from "react-router-dom";
import axiosAuthInstance from "../../utils/axios-auth-instance";
import { Loading } from '../../components/Loading'; 

function VisualizationShipment() {
  const { idShipment: pengirimanId } = useParams();
  const [layoutData, setLayoutData] = useState(null);
  const [showLoading, setShowLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pengirimanId) return;

    setShowLoading(true);
    axiosAuthInstance
      .post(`/box-layouting/${pengirimanId}`)
      .then((res) => {
        setLayoutData(res.data);
        setShowLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch box layout data:", err);
        setError(err);
        setShowLoading(false);
      });
  }, [pengirimanId]);

  // if (error) return <div>Error loading visualization: {error.message}</div>;
  // if (!layoutData) return <div>No layout data available</div>;

  return (
    <>
      <Loading visibility={showLoading} />
      
      <div className={showLoading ? 'hidden' : 'visible'}>
        {error ? (
          <div>Error loading visualization: {error.message}</div>
        ) : !layoutData ? (
          <div>No layout data available</div>
        ) : (
          <ThreeScene apiResponse={layoutData} />
        )}
      </div>
    </>
  );
}

export default VisualizationShipment;