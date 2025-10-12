import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dropdown } from '../../../components/Dropdown'
import { TextField } from '../../../components/TextField'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import { Modal } from '../../../components/Modal'
import { checkAttributeNull } from '../../../utils/utils'
import axiosAuthInstance from '../../../utils/axios-auth-instance'
import { BiSolidErrorCircle } from 'react-icons/bi'

function CreateRole() {
  let navigate = useNavigate()
  const [dataDC, setDataDC] = useState([])
  const [showLoading, setShowLoading] = useState(true)
  const [dataFitur, setDataFitur] = useState([
    { name: 'Pengiriman', value: 'is_allowed_shipment' },
    { name: 'Truk', value: 'is_allowed_truck' },
    { name: 'Lokasi', value: 'is_allowed_location' },
    { name: 'Order', value: 'is_allowed_order' }
  ])
  const [isFiturKosong, setIsFiturKosong] = useState(false)

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
  const [dcDropdown, setDCDropdown] = useState(null)

  const handleDCDropdownChange = (selectedValue) => {
    setDCDropdown(selectedValue)
    setNewRoleData({
      ...newRoleData,
      dc_id: selectedValue.value
    })
  }

  const [newRoleData, setNewRoleData] = useState({
    name: null,
    dc_id: null,
    is_allowed_shipment: false,
    is_allowed_order: false,
    is_allowed_location: false,
    is_allowed_truck: false,
    is_allowed_user: false
  })

  const handleInputChange = (name, value) => {
    setNewRoleData({ ...newRoleData, [name]: value })
  }

  const handleSelectFitur = (name) => {
    setNewRoleData({ ...newRoleData, [name]: !newRoleData[name] })
    console.log(name)
  }

  const handleSubmit = () => {
    console.log(newRoleData)

    const isNameAndDCIdFilled = newRoleData.name !== null && newRoleData.dc_id !== null
    const isAnyIsAllowedFalse = newRoleData.is_allowed_shipment === false && newRoleData.is_allowed_order === false && newRoleData.is_allowed_location === false && newRoleData.is_allowed_truck === false

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

  const createRole = async (e) => {
    e.preventDefault()
    setIsOpenConfirmation(false)
    setShowLoading(true)
    console.log(newRoleData)
    axiosAuthInstance
      .post('/api/role', newRoleData)
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
      <Modal variant="primary" isOpen={isOpenConfirmation} closeModal={() => setIsOpenConfirmation(false)} title="Buat Role" description="Anda yakin ingin menyimpan role baru?" rightButtonText="Yakin" onClickRight={createRole} leftButtonText="Batal" />

      <Modal variant="primary" isOpen={isOpenSuccess} closeModal={() => setIsOpenSuccess(false)} description="Berhasil menyimpan role baru." rightButtonText="Selesai" onClickRight={() => navigate('/role')} />
      <Modal variant="danger" isOpen={isOpenError} closeModal={() => setIsOpenError(false)} description="Gagal menyimpan role baru." rightButtonText="Ulangi" />

      <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
        <div className="p-8 bg-white rounded-lg">
          <h4>Masukan Data Role</h4>
          <div className="pt-4">
            <TextField label="Nama Role" placeholder="Contoh: Admin DC Banten" required={true} className="w-full" value={newRoleData.name} onChange={(e) => handleInputChange('name', e.target.value)} isError={isError && checkAttributeNull(newRoleData.name)} />

            <Dropdown placeholder="Contoh: DC Banten" label="Distribution Center (DC) " data={dataDC} className="w-full" required={true} value={dcDropdown} onChange={handleDCDropdownChange} isError={isError && checkAttributeNull(dcDropdown)} />

            <div className="sm:col-span-3 p-2">
              <label htmlFor="order-name" className="block m-p-med leading-6">
                Pilih Akses terhadap Fitur <span className="text-danger">*</span>
              </label>
              {dataFitur.map(({ name, value }, index) => {
                return (
                  <div className="flex items-center m-p-reg leading-6 space-x-2">
                    <input type="checkbox" value={name} onChange={(e) => handleSelectFitur(value)} />
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

export default CreateRole
