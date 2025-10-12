import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dropdown } from '../../../components/Dropdown'
import { TextField } from '../../../components/TextField'
import React, { useEffect, useState } from 'react'
import { Loading } from '../../../components/Loading'
import { Modal } from '../../../components/Modal'
import { checkAttributeNull } from '../../../utils/utils'
import axiosAuthInstance from '../../../utils/axios-auth-instance'

function UpdateUserAdmin() {
  let navigate = useNavigate()
  const [dataRole, setDataRole] = useState([])
  const [dataDC, setDataDC] = useState([])
  const [dataPerusahaan, setDataPerusahaan] = useState([])
  const [showLoading, setShowLoading] = useState(true)

  const dc_id = localStorage.getItem('dcId')
  const userRole = localStorage.getItem('userRole')
  const [dcName, setDcName] = useState()
  const location = useLocation()
  const userId = location.state.Id

  const [updateUserData, setUpdateUserData] = useState({
    id: null,
    username: null,
    first_name: null,
    last_name: null,
    email: null,
    phone_num: null,
    dc_id: null,
    company_id: null,
    role_id: null,
    is_active: true
  })

  useEffect(() => {
    async function fetchDataUser() {
      if (updateUserData.username === null) {
        try {
          const response = await axiosAuthInstance.get(`/api/user/${userId}`)
          const responseData = response.data.data

          const userData = {
            id: responseData.id,
            username: responseData.username,
            first_name: responseData.first_name,
            last_name: responseData.last_name,
            email: responseData.email,
            phone_num: responseData.phone_num,
            // dc_id: responseData.dc_id,
            company_id: responseData.company.id,
            role_id: responseData.role_id,
            // dc: responseData.dc,
            company: responseData.company,
            role: responseData.role,
            is_active: responseData.is_active
          }

          setUpdateUserData(userData)
          //   console.log(updateUserData);
          if (userData.role) {
            setRoleDropdown({
              name: userData.role.name,
              value: userData.role.id
            })
          }
          if (userData.company) {
            setPerusahaanDropdown({
              name: userData.company.name,
              value: userData.company.id
            })
          }
          console.log(userData)
          if (userData.is_active != null) {
            setStatusDropdown({
              name: userData.is_active ? 'Aktif' : 'Tidak Aktif',
              value: userData.is_active
            })
          }
          setShowLoading(false)
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
    }

    fetchDataUser()
  }, [updateUserData])

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
  const [statusDropdown, setStatusDropdown] = useState(null)

  const handleRoleDropdownChange = (selectedValue) => {
    setRoleDropdown(selectedValue)
    setUpdateUserData({
      ...updateUserData,
      role_id: selectedValue.value
    })
  }

  const handleDCDropdownChange = (selectedValue) => {
    setDCDropdown(selectedValue)
    setUpdateUserData({
      ...updateUserData,
      dc_id: selectedValue.value
    })
  }

  const handleCompDropdownChange = (selectedValue) => {
    setPerusahaanDropdown(selectedValue)
    setUpdateUserData({
      ...updateUserData,
      company_id: selectedValue.value
    })
  }

  const handleStatusDropdownChange = (selectedValue) => {
    setStatusDropdown(selectedValue)
    setUpdateUserData({
      ...updateUserData,
      is_active: selectedValue.value
    })
  }

  const handleInputChange = (name, value) => {
    setUpdateUserData({ ...updateUserData, [name]: value })
  }

  const handleSubmit = () => {
    if (updateUserData.username == null || updateUserData.first_name == null || updateUserData.last_name == null || updateUserData.email == null || updateUserData.phone_num == null || updateUserData.is_active == null || updateUserData.company_id == null || updateUserData.role_id == null) {
      setIsOpenError(true)
      setIsError(true)
    } else {
      setIsOpenConfirmation(true)
    }
  }

  const updateUser = async (e) => {
    e.preventDefault()
    setIsOpenConfirmation(false)
    setShowLoading(true)
    const updateUserFormat = {
      id: updateUserData.id,
      username: updateUserData.username,
      first_name: updateUserData.first_name,
      last_name: updateUserData.last_name,
      email: updateUserData.email,
      phone_num: updateUserData.phone_num,
      dc_id: updateUserData.dc_id,
      company_id: updateUserData.company.id,
      role_id: updateUserData.role_id,
      is_active: updateUserData.is_active
    }

    axiosAuthInstance
      .put('/api/user', updateUserFormat)
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
      <Modal variant="primary" isOpen={isOpenConfirmation} closeModal={() => setIsOpenConfirmation(false)} title="Buat User" description="Anda yakin ingin menyimpan data user?" rightButtonText="Yakin" onClickRight={updateUser} leftButtonText="Batal" />

      <Modal variant="primary" isOpen={isOpenSuccess} closeModal={() => setIsOpenSuccess(false)} description="Berhasil menyimpan data user." rightButtonText="Selesai" onClickRight={() => navigate('/user')} />
      <Modal variant="danger" isOpen={isOpenError} closeModal={() => setIsOpenError(false)} description="Gagal menyimpan data user." rightButtonText="Ulangi" />

      <div className={`px-[50px] py-[30px] ${showLoading ? 'hidden' : 'visible'}`}>
        <div className="p-8 bg-white rounded-lg">
          <h4>Masukan Data User</h4>
          <div className="pt-4">
            <div className="flex">
              <div className="w-[50%]">
                <TextField label="Nama Depan" placeholder="Contoh: Admin" className="w-full" value={updateUserData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} isError={isError && checkAttributeNull(updateUserData.first_name)} />
              </div>
              <div className="w-[50%]">
                <TextField label="Nama Belakang" placeholder="Contoh: Banten" className="w-full" value={updateUserData.last_name} onChange={(e) => handleInputChange('last_name', e.target.value)} isError={isError && checkAttributeNull(updateUserData.last_name)} />
              </div>
            </div>

            <TextField label="Username" placeholder="Contoh: AdminBanten" required={true} className="w-full" value={updateUserData.username} onChange={(e) => handleInputChange('username', e.target.value)} isError={isError && checkAttributeNull(updateUserData.username)} disabled={true} />

            {/* <TextField label="Password" placeholder="Contoh: AdminBanten" required={true} className="w-full" value={newUserData.password} onChange={(e) => handleInputChange("password", e.target.value)} isError={isError && checkAttributeNull(newUserData.password)}/> */}

            <TextField label="Email" placeholder="Contoh: AdminBanten@Paracorp.com" required={true} className="w-full" value={updateUserData.email} onChange={(e) => handleInputChange('email', e.target.value)} isError={isError && checkAttributeNull(updateUserData.email)} />

            <TextField label="Nomor Telfon" placeholder="Contoh: 08123456789" required={true} className="w-full" value={updateUserData.phone_num} onChange={(e) => handleInputChange('phone_num', e.target.value)} isError={isError && checkAttributeNull(updateUserData.phone_num)} />

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

export default UpdateUserAdmin
