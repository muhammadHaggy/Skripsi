import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dropdown } from '../../../components/Dropdown'
import { TextField } from '../../../components/TextField'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import { Modal } from '../../../components/Modal'
import { checkAttributeNull } from '../../../utils/utils'
import axiosAuthInstance from '../../../utils/axios-auth-instance'

function UpdateTrukAdmin() {
  let navigate = useNavigate()
  const location = useLocation()
  const trukId = location.state.Id
  const dc_id = localStorage.getItem('dcId')
  const userRole = localStorage.getItem('userRole')

  //Handle Create Req
  const [isOpenConfirmation, setIsOpenConfirmation] = useState(false)
  const [isOpenError, setIsOpenError] = useState(false)
  const [isOpenSuccess, setIsOpenSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [perusahaanDropdown, setPerusahaanDropdown] = useState(null)
  const [dcDropdown, setDCDropdown] = useState(null)
  const [statusDropdown, setStatusDropdown] = useState(null)
  const [dataStatus, setDataStatus] = useState([])
  const [dataDC, setDataDC] = useState([])

  let status = ['AVAILABLE', 'ON DELIVERY', 'ARCHIVE', 'OOS - LEGAL', 'OOS - MAINTENANCE']
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    if (dataDC.length === 0) {
      axiosAuthInstance.get('/api/dcs').then((response) => {
        const dcData = response.data.data.map((item) => ({
          value: item.id,
          name: item.name
        }))
        setDataDC(dcData)
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

  const [updateTrukData, setUpdateTrukData] = useState({
    id: null,
    plate_number: null,
    max_capacity_volume: null,
    max_capacity_pallet: null,
    max_individual_capacity_volume: null,
    company: null,
    dc: null,
    first_status: null,
    second_status: null,
    third_status: null,
    type: null,
    dc_id: null
  })

  useEffect(() => {
    async function fetchDataTruk() {
      if (updateTrukData.plate_number === null) {
        try {
          const response = await axiosAuthInstance.get(`/api/truck/${trukId}`)
          const responseData = response.data.data

          const trukData = {
            id: responseData.id,
            plate_number: responseData.plate_number,
            max_capacity_volume: responseData.type.max_capacity_volume,
            max_capacity_pallet: responseData.type.max_capacity_pallet,
            max_individual_capacity_volume: responseData.max_individual_capacity_volume,
            company: responseData.company,
            dc: responseData.dc,
            first_status: responseData.first_status,
            second_status: responseData.second_status,
            third_status: responseData.third_status,
            type: responseData.type,
            dc_id: responseData.dc.id
          }
          setUpdateTrukData(trukData)
          if (trukData.company) {
            setPerusahaanDropdown({
              name: trukData.company.name,
              value: trukData.company.id
            })
          }

          if (trukData.first_status == 'AVAILABLE') {
            setStatusDropdown({ name: 'AVAILABLE' })
          } else if (trukData.second_status !== null && trukData.second_status == 'ON_DELIVERY') {
            setStatusDropdown({ name: 'ON DELIVERY' })
          } else if (trukData.second_status !== null && trukData.second_status == 'ARCHIVE') {
            setStatusDropdown({ name: 'ARCHIVE' })
          } else if (trukData.third_status !== null && trukData.third_status == 'MAINTENANCE') {
            setStatusDropdown({ name: 'OOS - MAINTENANCE' })
          } else if (trukData.third_status !== null && trukData.third_status == 'LEGAL') {
            setStatusDropdown({ name: 'OOS - LEGAL' })
          }

          if (trukData.dc) {
            setDCDropdown({
              name: trukData.dc.name,
              value: trukData.dc.id
            })
          }
          setShowLoading(false)
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
    }

    fetchDataTruk()
  }, [updateTrukData])

  const handleInputChange = (name, value) => {
    setUpdateTrukData({ ...updateTrukData, [name]: value })
  }

  const handleDCDropdownChange = (selectedValue) => {
    setDCDropdown(selectedValue)
    setUpdateTrukData({
      ...updateTrukData,
      dc_id: selectedValue.value
    })
  }

  const handleStatusDropdownChange = (selectedValue) => {
    setStatusDropdown(selectedValue)
    if (selectedValue.value == 'AVAILABLE') {
      setUpdateTrukData({
        ...updateTrukData,
        first_status: 'AVAILABLE',
        second_status: null,
        third_status: null
      })
    } else if (selectedValue.value == 'ARCHIVE') {
      setUpdateTrukData({
        ...updateTrukData,
        first_status: 'UNAVAILABLE',
        second_status: 'ARCHIVE',
        third_status: null
      })
    } else if (selectedValue.value == 'ON DELIVERY') {
      setUpdateTrukData({
        ...updateTrukData,
        first_status: 'UNAVAILABLE',
        second_status: 'ON_DELIVERY',
        third_status: null
      })
    } else if (selectedValue.value == 'OOS - MAINTENANCE') {
      setUpdateTrukData({
        ...updateTrukData,
        first_status: 'UNAVAILABLE',
        second_status: 'OOS',
        third_status: 'MAINTENANCE'
      })
    } else if (selectedValue.value == 'OOS - LEGAL') {
      setUpdateTrukData({
        ...updateTrukData,
        first_status: 'UNAVAILABLE',
        second_status: 'OOS',
        third_status: 'LEGAL'
      })
    }
  }

  const handleSubmit = () => {
    if (
      updateTrukData.id == null ||
      updateTrukData.plate_number == null ||
      updateTrukData.max_capacity_volume == null ||
      // updateTrukData.max_capacity_pallet == null ||
      updateTrukData.max_individual_capacity_volume == null ||
      updateTrukData.company == null ||
      updateTrukData.dc == null ||
      updateTrukData.type == null ||
      updateTrukData.dc_id == null
    ) {
      setIsOpenError(true)
      setIsError(true)
    } else {
      setIsOpenConfirmation(true)
    }
  }

  const updateTruk = async (e) => {
    e.preventDefault()
    setIsOpenConfirmation(false)
    const updateTrukFormat = {
      id: updateTrukData.id,
      plate_number: updateTrukData.plate_number,
      company_id: updateTrukData.company.id,
      dc_id: updateTrukData.dc_id,
      first_status: updateTrukData.first_status,
      second_status: updateTrukData.second_status,
      third_status: updateTrukData.third_status,
      type_id: updateTrukData.type.id,
      max_individual_capacity_volume: updateTrukData.max_individual_capacity_volume
    }
    // console.log("hahba")
    // console.log(updateTrukFormat)
    axiosAuthInstance
      .put('/api/truck', updateTrukFormat)
      .then((response) => {
        if (response.status == 200) {
          setShowLoading(false)
          setIsOpenSuccess(true)
        }
      })
      .catch((err) => {
        setShowLoading(false)
        setIsOpenError(true)
      })
  }

  return (
    <div className="relative h-full">
      <Loading visibility={showLoading} />
      <Modal variant="primary" isOpen={isOpenConfirmation} closeModal={() => setIsOpenConfirmation(false)} title="Ubah Data Truk" description="Anda yakin ingin menyimpan data truk?" rightButtonText="Yakin" onClickRight={updateTruk} leftButtonText="Batal" />

      <Modal variant="primary" isOpen={isOpenSuccess} closeModal={() => setIsOpenSuccess(false)} description="Berhasil menyimpan data truk." rightButtonText="Selesai" onClickRight={() => navigate('/truk')} />
      <Modal variant="danger" isOpen={isOpenError} closeModal={() => setIsOpenError(false)} description="Gagal menyimpan data truk." rightButtonText="Ulangi" />

      <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
        <div className="p-8 bg-white rounded-lg">
          <h4>Masukan Data Truk</h4>
          <div className="pt-4">
            <TextField label="Plat Kendaraan" placeholder="Plat Kendaraan" required={true} className="w-full" value={updateTrukData.plate_number} onChange={(e) => handleInputChange('plate_number', e.target.value)} isError={isError && checkAttributeNull(updateTrukData.plate_number)} disabled={true} />

            <Dropdown placeholder="Tipe Kendaraan" label="Tipe Kendaraan" data={[]} className="w-full" required={true} value={updateTrukData.type} disabled={true} />

            {/* <div className="flex"> */}
            <div className="w-full">
              <TextField label="Volume Maksimal Kendaraan (ml)" className="w-full" value={updateTrukData.max_individual_capacity_volume} onChange={(e) => handleInputChange('max_individual_capacity_volume', e.target.value)} isError={isError && checkAttributeNull(updateTrukData.max_individual_capacity_volume)} />
            </div>
            {/* <div className="w-[50%]">
                                <TextField label="Berat Maksimal Kendaraan (kg)"className="w-full" value={updateTrukData.max_capacity_pallet} disabled={true}/>
                            </div> */}
            {/* </div> */}

            <Dropdown placeholder="Asal Perusahaan" label="Asal Perusahaan" data={[]} className="w-full" required={true} value={perusahaanDropdown} isError={isError && checkAttributeNull(perusahaanDropdown)} disabled={true} />
            {dc_id !== 'null' ? <Dropdown placeholder="Distribution Center (DC)" label="Distribution Center (DC)" data={dataDC} className="w-full" required={true} value={dcDropdown} onChange={handleDCDropdownChange} isError={isError && checkAttributeNull(dcDropdown)} disabled={true} /> : userRole === 'Super' ? <Dropdown placeholder="Distribution Center (DC)" label="Distribution Center (DC)" data={dataDC} className="w-full" required={true} value={dcDropdown} onChange={handleDCDropdownChange} isError={isError && checkAttributeNull(dcDropdown)} /> : null}

            <Dropdown placeholder="Status" label="Status" data={dataStatus} className="w-full" required={true} value={statusDropdown} onChange={handleStatusDropdownChange} />
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

export default UpdateTrukAdmin
