import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dropdown } from '../../../components/Dropdown'
import { TextField } from '../../../components/TextField'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import { Modal } from '../../../components/Modal'
import { checkAttributeNull } from '../../../utils/utils'
import axiosAuthInstance from '../../../utils/axios-auth-instance'

function CreateTrukAdmin() {
  let navigate = useNavigate()
  const [dataPerusahaan, setDataPerusahaan] = useState([])
  const [dataTipe, setDataTipe] = useState([])
  const [dataDC, setDataDC] = useState([])
  const [dataStatus, setDataStatus] = useState([])
  const [showLoading, setShowLoading] = useState(true)

  const [volume, setVolume] = useState('-')
  const [pallet, setPallet] = useState('-')
  const dc_id = localStorage.getItem('dcId')
  const userRole = localStorage.getItem('userRole')
  const [dcName, setDcName] = useState()

  let status = ['AVAILABLE', 'ON DELIVERY', 'ARCHIVE', 'OOS - LEGAL', 'OOS - MAINTENANCE']

  useEffect(() => {
    if (dataPerusahaan.length === 0) {
      axiosAuthInstance
        .get('/api/companies', {
          params: {
            is_paragon: true,
            has_location: true
          }
        })
        .then((response) => {
          const compData = response.data.data.map((item) => ({
            value: item.id,
            name: item.name
          }))
          setDataPerusahaan(compData)
          setShowLoading(false)
        })
    }
  }, [dataPerusahaan])

  useEffect(() => {
    if (dataTipe.length === 0) {
      axiosAuthInstance.get('/api/truck-types').then((response) => {
        const tipeData = response.data.data.map((item) => ({
          value: item.id,
          name: item.name,
          volume: item.max_capacity_volume,
          pallet: item.max_capacity_pallet
        }))
        setDataTipe(tipeData)
        setShowLoading(false)
      })
    }
  }, [dataTipe])

  useEffect(() => {
    if (dataDC.length === 0) {
      axiosAuthInstance.get('/api/dcs').then((response) => {
        const dcData = response.data.data.map((item) => ({
          value: item.id,
          name: item.name
        }))
        if (dc_id !== 'null') {
          setDcName(dcData[parseInt(dc_id) - 1])
          setNewTrukData({
            ...newTrukData,
            dc_id: dc_id
          })
        } else {
          setDataDC(dcData)
        }
        setShowLoading(false)
      })
    }
  }, [dataDC])

  useEffect(() => {
    if (dataStatus.length === 0) {
      const statusData = status.map((item) => ({
        value: item,
        name: item
      }))
      setDataStatus(statusData)
      setShowLoading(false)
    }
  }, [dataStatus])

  //Handle Create Req
  const [isOpenConfirmation, setIsOpenConfirmation] = useState(false)
  const [isOpenError, setIsOpenError] = useState(false)
  const [isOpenSuccess, setIsOpenSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [perusahaanDropdown, setPerusahaanDropdown] = useState(null)
  const [tipeDropdown, setTipeDropdown] = useState(null)
  const [dcDropdown, setDCDropdown] = useState(null)
  const [statusDropdown, setStatusDropdown] = useState(null)

  const [newTrukData, setNewTrukData] = useState({
    plate_number: null,
    company_id: null,
    dc_id: null,
    first_status: null,
    second_status: null,
    third_status: null,
    type_id: null,
    max_individual_capacity_volume: null
  })

  const handleInputChange = (name, value) => {
    setNewTrukData({ ...newTrukData, [name]: value })
  }

  const handleCompDropdownChange = (selectedValue) => {
    setPerusahaanDropdown(selectedValue)
    setNewTrukData({
      ...newTrukData,
      company_id: selectedValue.value
    })
  }

  const handleTypeDropdownChange = (selectedValue) => {
    setTipeDropdown(selectedValue)
    setPallet(selectedValue.pallet)
    setVolume(selectedValue.volume)
    setNewTrukData({
      ...newTrukData,
      type_id: selectedValue.value,
      max_individual_capacity_volume: selectedValue.volume
    })
  }

  const handleDCDropdownChange = (selectedValue) => {
    setDCDropdown(selectedValue)
    setNewTrukData({
      ...newTrukData,
      dc_id: selectedValue.value
    })
  }

  const handleStatusDropdownChange = (selectedValue) => {
    setStatusDropdown(selectedValue)
    if (selectedValue.value == 'AVAILABLE') {
      setNewTrukData({
        ...newTrukData,
        first_status: 'AVAILABLE',
        second_status: null,
        third_status: null
      })
    } else if (selectedValue.value == 'ARCHIVE') {
      setNewTrukData({
        ...newTrukData,
        first_status: 'UNAVAILABLE',
        second_status: 'ARCHIVE',
        third_status: null
      })
    } else if (selectedValue.value == 'ON DELIVERY') {
      setNewTrukData({
        ...newTrukData,
        first_status: 'UNAVAILABLE',
        second_status: 'ON_DELIVERY',
        third_status: null
      })
    } else if (selectedValue.value == 'OOS - MAINTENANCE') {
      setNewTrukData({
        ...newTrukData,
        first_status: 'UNAVAILABLE',
        second_status: 'OOS',
        third_status: 'MAINTENANCE'
      })
    } else if (selectedValue.value == 'OOS - LEGAL') {
      setNewTrukData({
        ...newTrukData,
        first_status: 'UNAVAILABLE',
        second_status: 'OOS',
        third_status: 'LEGAL'
      })
    }
  }

  const handleSubmit = () => {
    if (newTrukData.plate_number == null || newTrukData.company_id == null || newTrukData.first_status == null || newTrukData.dc_id == null || newTrukData.type_id == null) {
      setIsOpenError(true)
      setIsError(true)
    } else {
      setIsOpenConfirmation(true)
    }
  }

  const createTruk = async (e) => {
    e.preventDefault()
    setIsOpenConfirmation(false)
    setShowLoading(true)
    console.log(newTrukData)
    axiosAuthInstance
      .post('/api/truck', newTrukData)
      .then((response) => {
        if (response.status == 200) {
          setShowLoading(false)
          setIsOpenSuccess(true)
        }
      })
      .catch((err) => {
        setShowLoading(false)
        setIsOpenError(true)
        console.log(err)
      })
  }

  return (
    <div className="relative h-full">
      <Loading visibility={showLoading} />
      <Modal variant="primary" isOpen={isOpenConfirmation} closeModal={() => setIsOpenConfirmation(false)} title="Buat Truk" description="Anda yakin ingin menyimpan truk baru?" rightButtonText="Yakin" onClickRight={createTruk} leftButtonText="Batal" />

      <Modal variant="primary" isOpen={isOpenSuccess} closeModal={() => setIsOpenSuccess(false)} description="Berhasil menyimpan data truk." rightButtonText="Selesai" onClickRight={() => navigate('/truk')} />
      <Modal variant="danger" isOpen={isOpenError} closeModal={() => setIsOpenError(false)} description="Gagal menyimpan data truk." rightButtonText="Ulangi" />

      <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
        <div className="p-8 bg-white rounded-lg">
          <h4>Masukan Data Truk</h4>
          <div className="pt-4">
            <TextField label="Plat Kendaraan" placeholder="B1234RFS" required={true} className="w-full" value={newTrukData.plate_number} onChange={(e) => handleInputChange('plate_number', e.target.value)} isError={isError && checkAttributeNull(newTrukData.plate_number)} />

            <Dropdown label="Tipe Kendaraan" placeholder="Contoh: Blind Van" data={dataTipe} className="w-full" required={true} value={tipeDropdown} onChange={handleTypeDropdownChange} isError={isError && checkAttributeNull(tipeDropdown)} />

            <div className="flex">
              <div className="w-full">
                <TextField label="Volume Maksimal Kendaraan (ml)" placeholder="0" className="w-full" value={newTrukData.max_individual_capacity_volume} onChange={(e) => handleInputChange('max_individual_capacity_volume', e.target.value)} isError={isError && checkAttributeNull(newTrukData.max_individual_capacity_volume)} />
              </div>
              {/* <div className="w-full">
                                <TextField label="Berat Maksimal Kendaraan (kg)"className="w-full" value={pallet} disabled={true}/>
                            </div> */}
            </div>

            <Dropdown placeholder="Contoh: PARAMA" label="Asal Perusahaan" data={dataPerusahaan} className="w-full" required={true} value={perusahaanDropdown} onChange={handleCompDropdownChange} isError={isError && checkAttributeNull(perusahaanDropdown)} />

            {dc_id !== 'null' ? <Dropdown placeholder="Contoh: Jakarta Timur" label="Distribution Center (DC) " data={dataDC} className="w-full" required={true} value={dcName} onChange={handleDCDropdownChange} disabled={true} /> : userRole === 'Super' ? <Dropdown placeholder="Contoh: Jakarta Timur" label="Distribution Center (DC) " data={dataDC} className="w-full" required={true} value={dcDropdown} onChange={handleDCDropdownChange} isError={isError && checkAttributeNull(dcDropdown)} /> : null}

            <Dropdown placeholder="AVAILABLE" label="Status" data={dataStatus} className="w-full" required={true} value={statusDropdown} onChange={handleStatusDropdownChange} isError={isError && checkAttributeNull(statusDropdown)} />
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button className="text-button btn-primary-outline" label="Kembali" onClick={() => navigate('/truk')} />
          <Button className="text-button btn-primary" label="Simpan" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  )
}

export default CreateTrukAdmin
