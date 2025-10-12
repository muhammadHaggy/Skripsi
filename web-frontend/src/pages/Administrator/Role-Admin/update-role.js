import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { TextField } from '../../../components/TextField'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import { Modal } from '../../../components/Modal'
import { checkAttributeNull } from '../../../utils/utils'
import axiosAuthInstance from '../../../utils/axios-auth-instance'
import { BiSolidErrorCircle } from 'react-icons/bi'

function UpdateRole() {
  let navigate = useNavigate()
  const location = useLocation()
  const [dataDC, setDataDC] = useState([])
  const [showLoading, setShowLoading] = useState(true)
  const [dataFitur, setDataFitur] = useState([
    { name: 'Pengiriman', value: 'is_allowed_shipment', check: false },
    { name: 'Truk', value: 'is_allowed_truck', check: false },
    { name: 'Lokasi', value: 'is_allowed_location', check: false },
    { name: 'Order', value: 'is_allowed_order', check: false }
  ])
  const [isFiturKosong, setIsFiturKosong] = useState(false)
  const roleId = location.state.Id
  const [dcDropdown, setDCDropdown] = useState('-')

  const [updateRoleData, setUpdateRoleData] = useState({
    id: null,
    name: null,
    dc: { name: '' },
    is_allowed_shipment: null,
    is_allowed_order: null,
    is_allowed_location: null,
    is_allowed_truck: null,
    is_allowed_user: null
  })

  useEffect(() => {
    async function fetchDataRole() {
      if (updateRoleData.name === null) {
        try {
          const response = await axiosAuthInstance.get(`/api/role/${roleId}`)
          const responseData = response.data.data

          const roleData = {
            id: responseData.id,
            name: responseData.name,
            dc: responseData.dc,
            is_allowed_shipment: responseData.is_allowed_shipment,
            is_allowed_order: responseData.is_allowed_order,
            is_allowed_location: responseData.is_allowed_location,
            is_allowed_truck: responseData.is_allowed_truck,
            is_allowed_user: responseData.is_allowed_user
          }

          setDataFitur((prevDataFitur) => prevDataFitur.map((item) => ({ ...item, check: roleData[item.value] === true })))

          setUpdateRoleData(roleData)
          setDCDropdown(roleData.dc.name)
          setShowLoading(false)
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
    }

    fetchDataRole()
    console.log(dcDropdown)
  }, [])

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

  //Handle Create Req
  const [isOpenConfirmation, setIsOpenConfirmation] = useState(false)
  const [isOpenError, setIsOpenError] = useState(false)
  const [isOpenSuccess, setIsOpenSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleInputChange = (name, value) => {
    setUpdateRoleData({ ...updateRoleData, [name]: value })
  }

  const handleSelectFitur = (name) => {
    setUpdateRoleData({ ...updateRoleData, [name]: !updateRoleData[name] })
    setDataFitur(dataFitur.map((item) => (item.value === name ? { ...item, check: !item.check } : item)))
    // console.log(name)
  }

  const handleSubmit = () => {
    // console.log(updateRoleData);

    // const isNameAndDCIdFilled = updateRoleData.name !== null && updateRoleData.dc_id !== null;
    const isNameAndDCIdFilled = updateRoleData.name !== null
    const isAnyIsAllowedFalse = updateRoleData.is_allowed_shipment === false && updateRoleData.is_allowed_order === false && updateRoleData.is_allowed_location === false && updateRoleData.is_allowed_truck === false

    if (isAnyIsAllowedFalse == false && isNameAndDCIdFilled == true) {
      setIsOpenConfirmation(true)
      setIsFiturKosong(false)
    } else {
      if (isAnyIsAllowedFalse == true && isNameAndDCIdFilled == false) {
        setIsFiturKosong(true)
        setIsOpenError(true)
        setIsError(true)
      } else if (isAnyIsAllowedFalse == true && isNameAndDCIdFilled == true) {
        setIsFiturKosong(false)
        setIsOpenError(true)
        setIsFiturKosong(true)
      } else if (isAnyIsAllowedFalse == false && isNameAndDCIdFilled == false) {
        setIsFiturKosong(false)
        setIsOpenError(true)
        setIsError(true)
      }
    }
  }

  const updateRole = async (e) => {
    e.preventDefault()
    setIsOpenConfirmation(false)
    setShowLoading(true)

    const updateRoleFormat = {
      id: updateRoleData.id,
      name: updateRoleData.name,
      dc_id: updateRoleData.dc_id,
      is_allowed_shipment: updateRoleData.is_allowed_shipment,
      is_allowed_order: updateRoleData.is_allowed_order,
      is_allowed_location: updateRoleData.is_allowed_location,
      is_allowed_truck: updateRoleData.is_allowed_truck,
      is_allowed_user: updateRoleData.is_allowed_user
    }
    axiosAuthInstance
      .put('/api/role', updateRoleFormat)
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
      <Modal variant="primary" isOpen={isOpenConfirmation} closeModal={() => setIsOpenConfirmation(false)} title="Buat Role" description="Anda yakin ingin menyimpan role baru?" rightButtonText="Yakin" onClickRight={updateRole} leftButtonText="Batal" />

      <Modal variant="primary" isOpen={isOpenSuccess} closeModal={() => setIsOpenSuccess(false)} description="Berhasil menyimpan role baru." rightButtonText="Selesai" onClickRight={() => navigate('/role')} />
      <Modal variant="danger" isOpen={isOpenError} closeModal={() => setIsOpenError(false)} description="Gagal menyimpan role baru." rightButtonText="Ulangi" />

      <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
        <div className="p-8 bg-white rounded-lg">
          <h4>Masukan Data Role</h4>
          <div className="pt-4">
            <TextField label="Nama Role" placeholder="Contoh: Admin DC Banten" required={true} className="w-full" value={updateRoleData.name} onChange={(e) => handleInputChange('name', e.target.value)} isError={isError && checkAttributeNull(updateRoleData.name)} disabled={true} />

            {/* <TextField label="Distribution Center (DC)" placeholder="Contoh: DC Banten" required={true} className="w-full" value={updateRoleData.dc.name} disabled={true} /> */}
            <TextField
              label="Distribution Center (DC)"
              placeholder="-"
              required={true}
              className="w-full"
              value={updateRoleData.dc?.name} // Use optional chaining here
              disabled={true}
            />
            <div className="sm:col-span-3 p-2">
              <label htmlFor="order-name" className="block m-p-med leading-6">
                Pilih Akses terhadap Fitur <span className="text-danger">*</span>
              </label>
              {dataFitur.map(({ name, value, check }, index) => {
                return (
                  <div className="flex items-center m-p-reg leading-6 space-x-2">
                    <input type="checkbox" value={name} checked={check} onChange={(e) => handleSelectFitur(value)} />
                    <p className="m-p-reg">{name}</p>
                  </div>
                )
              })}
              {isFiturKosong ? (
                <div className="flex items-center text-neutral-60">
                  <BiSolidErrorCircle className="text-danger" />
                  <p className="pl-1 leading-6 s-p-med text-danger">Harus memilih salah satu fitur</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button className="text-button btn-primary-outline" label="Kembali" onClick={() => navigate('/role')} />
          <Button className="text-button btn-primary" label="Simpan" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  )
}

export default UpdateRole
