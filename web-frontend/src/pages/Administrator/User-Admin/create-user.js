import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dropdown } from '../../../components/Dropdown'
import { TextField } from '../../../components/TextField'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import { Modal } from '../../../components/Modal'
import { checkAttributeNull } from '../../../utils/utils'
import axiosAuthInstance from '../../../utils/axios-auth-instance'

function CreateUserAdmin() {
  let navigate = useNavigate()
  const [dataRole, setDataRole] = useState([])
  const [dataDC, setDataDC] = useState([])
  const [dataPerusahaan, setDataPerusahaan] = useState([])
  const [showLoading, setShowLoading] = useState(true)

  const dc_id = localStorage.getItem('dcId')
  const userRole = localStorage.getItem('userRole')
  const [dcName, setDcName] = useState()

  useEffect(() => {
    if (dataRole.length === 0) {
      axiosAuthInstance.get('/api/roles').then((response) => {
        const roleData = response.data.data.map((item) => ({
          value: item.id,
          name: item.name
        }))
        setDataRole(roleData)
        setShowLoading(false)
      })
    }
  }, [dataRole])

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

  const dataStatus = [
    {
      value: true,
      name: 'Aktif'
    },
    {
      value: false,
      name: 'Tidak Aktif'
    }
  ]
  //Handle Create Req
  const [isOpenConfirmation, setIsOpenConfirmation] = useState(false)
  const [isOpenError, setIsOpenError] = useState(false)
  const [isOpenSuccess, setIsOpenSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [perusahaanDropdown, setPerusahaanDropdown] = useState(null)
  const [roleDropdown, setRoleDropdown] = useState(null)
  const [dcDropdown, setDCDropdown] = useState(null)
  const [statusDropdown, setStatusDropdown] = useState({
    value: true,
    name: 'Aktif'
  })

  const handleRoleDropdownChange = (selectedValue) => {
    setRoleDropdown(selectedValue)
    setNewUserData({
      ...newUserData,
      role_id: selectedValue.value
    })
  }

  const handleDCDropdownChange = (selectedValue) => {
    setDCDropdown(selectedValue)
    setNewUserData({
      ...newUserData,
      dc_id: selectedValue.value
    })
  }

  const handleCompDropdownChange = (selectedValue) => {
    setPerusahaanDropdown(selectedValue)
    setNewUserData({
      ...newUserData,
      company_id: selectedValue.value
    })
  }

  const handleStatusDropdownChange = (selectedValue) => {
    setStatusDropdown(selectedValue)
    setNewUserData({
      ...newUserData,
      is_active: selectedValue.value
    })
  }

  const [newUserData, setNewUserData] = useState({
    username: null,
    password: null,
    first_name: null,
    last_name: null,
    email: null,
    phone_num: null,
    // dc_id: null,
    company_id: null,
    role_id: null,
    is_active: true
  })

  const handleInputChange = (name, value) => {
    setNewUserData({ ...newUserData, [name]: value })
  }

  const handleSubmit = () => {
    console.log(newUserData)
    if (newUserData.username == null || newUserData.password == null || newUserData.first_name == null || newUserData.last_name == null || newUserData.email == null || newUserData.phone_num == null || newUserData.is_active == null || newUserData.company_id == null || newUserData.role_id == null) {
      setIsOpenError(true)
      setIsError(true)
    } else {
      setIsOpenConfirmation(true)
    }
  }

  const createUser = async (e) => {
    e.preventDefault()
    setIsOpenConfirmation(false)
    setShowLoading(true)
    console.log(newUserData)
    axiosAuthInstance
      .post('/api/user', newUserData)
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
      <Modal variant="primary" isOpen={isOpenConfirmation} closeModal={() => setIsOpenConfirmation(false)} title="Buat User" description="Anda yakin ingin menyimpan user baru?" rightButtonText="Yakin" onClickRight={createUser} leftButtonText="Batal" />

      <Modal variant="primary" isOpen={isOpenSuccess} closeModal={() => setIsOpenSuccess(false)} description="Berhasil menyimpan user baru." rightButtonText="Selesai" onClickRight={() => navigate('/user')} />
      <Modal variant="danger" isOpen={isOpenError} closeModal={() => setIsOpenError(false)} description="Gagal menyimpan user baru." rightButtonText="Ulangi" />

      <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
        <div className="p-8 bg-white rounded-lg">
          <h4>Masukan Data User</h4>
          <div className="pt-4">
            <div className="flex">
              <div className="w-[50%]">
                <TextField label="Nama Depan" placeholder="Contoh: Admin" className="w-full" required={true} value={newUserData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} isError={isError && checkAttributeNull(newUserData.first_name)} />
              </div>
              <div className="w-[50%]">
                <TextField label="Nama Belakang" placeholder="Contoh: Banten" className="w-full" required={true} value={newUserData.last_name} onChange={(e) => handleInputChange('last_name', e.target.value)} isError={isError && checkAttributeNull(newUserData.last_name)} />
              </div>
            </div>

            <TextField label="Username" placeholder="Contoh: AdminBanten" required={true} className="w-full" value={newUserData.username} onChange={(e) => handleInputChange('username', e.target.value)} isError={isError && checkAttributeNull(newUserData.username)} />

            <TextField label="Email" placeholder="Contoh: AdminBanten@Paracorp.com" required={true} className="w-full" value={newUserData.email} onChange={(e) => handleInputChange('email', e.target.value)} isError={isError && checkAttributeNull(newUserData.email)} />

            <TextField label="Password" placeholder="Contoh: AdminBanten" required={true} className="w-full" value={newUserData.password} onChange={(e) => handleInputChange('password', e.target.value)} isError={isError && checkAttributeNull(newUserData.password)} />

            <TextField label="Nomor Telfon" placeholder="Contoh: 08123456789" required={true} className="w-full" value={newUserData.phone_num} onChange={(e) => handleInputChange('phone_num', e.target.value)} isError={isError && checkAttributeNull(newUserData.phone_num)} />

            <Dropdown placeholder="Contoh: Admin DC Banten" label="Role" data={dataRole} className="w-full" required={true} value={roleDropdown} onChange={handleRoleDropdownChange} isError={isError && checkAttributeNull(roleDropdown)} />

            {/* <Dropdown placeholder="Contoh: Jakarta Timur" label="Distribution Center (DC) " data={dataDC} className="w-full" required={true} value={dcDropdown} onChange={handleDCDropdownChange} isError={isError && checkAttributeNull(dcDropdown)}/> */}

            <Dropdown placeholder="Contoh: PARAMA" label="Asal Perusahaan" data={dataPerusahaan} className="w-full" required={true} value={perusahaanDropdown} onChange={handleCompDropdownChange} isError={isError && checkAttributeNull(perusahaanDropdown)} />

            {/* <Dropdown placeholder="Aktif" label="Status User" data={dataStatus} className="w-full" required={true} value={statusDropdown} onChange={handleStatusDropdownChange} isError={isError && checkAttributeNull(statusDropdown)}/> */}
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button className="text-button btn-primary-outline" label="Kembali" onClick={() => navigate('/user')} />
          <Button className="text-button btn-primary" label="Simpan" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  )
}

export default CreateUserAdmin
