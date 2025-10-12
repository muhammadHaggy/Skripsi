import { useEffect, useState } from 'react'
import { BsBoxSeam, BsTruck, BsCart } from 'react-icons/bs'
import axiosAuthInstance from '../../../utils/axios-auth-instance'

function DashboardAdmin() {
  const [totalOrder, setTotalOrder] = useState(0)
  const [totalTruk, setTotalTruk] = useState(0)
  const [totalPengiriman, setTotalPengiriman] = useState(0)
  const [totalOrderBelumDiProses, setTotalOrderBelumDiProses] = useState(0)
  const [totalTrukTersedia, setTotalTrukTersedia] = useState(0)

  useEffect(() => {
    axiosAuthInstance.get("/administrator/dashboard").then((response) => {
    setTotalOrder(response.data.data["Total Order"]);
    setTotalTruk(response.data.data["Total Truk"]);
    setTotalPengiriman(response.data.data["Total Pengiriman"]);
    setTotalOrderBelumDiProses(response.data.data["Total Order Belum Di Proses"]);
    setTotalTrukTersedia(response.data.data["Total Truk Tersedia"]);
    });
  }, [])

  return (
    <div className="px-[50px] py-[30px] space-y-[40px]">
      <div className="grid grid-cols-3 space-x-[40px]">
        <div className="flex bg-neutral-10 items-center p-[40px] rounded-[12px] space-x-[40px] shadow-md">
          <BsCart size={50} className="text-primary" />
          <div className="flex flex-col items-center space-y-[10px]">
            <p className="w-full text-lg text-[16px] text-neutral-50 font-semibold">Total Order</p>
            <h2 className="w-full text-left text-primary text-font-bold">{totalOrder}</h2>
          </div>
        </div>
        <div className="flex bg-neutral-10 items-center p-[40px] rounded-[12px] space-x-[40px] shadow-md">
          <BsTruck size={50} className="text-primary" />
          <div className="flex flex-col items-center space-y-[10px]">
            <p className="w-full text-lg text-[16px] text-neutral-50 font-semibold">Total Truk</p>
            <h2 className="w-full text-left text-primary text-font-bold">{totalTruk}</h2>
          </div>
        </div>
        <div className="flex bg-neutral-10 items-center p-[40px] rounded-[12px] space-x-[40px] shadow-md">
          <BsBoxSeam size={50} className="text-primary" />
          <div className="flex flex-col items-center space-y-[10px]">
            <p className="w-full text-lg text-[16px] text-neutral-50 font-semibold">Total Pengiriman</p>
            <h2 className="w-full text-left text-primary text-font-bold">{totalPengiriman}</h2>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 space-x-[40px]">
        <div className="flex bg-warning-surface items-center p-[40px] rounded-[12px] space-x-[40px] shadow-md">
          <BsCart size={50} className="text-black" />
          <div className="flex flex-col items-center space-y-[10px]">
            <div className="flex w-full space-x-[5px]">
              <p className="text-lg text-[16px] text-neutral-50 font-semibold">Total Order</p>
              <p className="text-lg text-[16px] text-warning-hover font-semibold">Belum di Proses</p>
            </div>
            <h2 className="w-full text-left text-black text-font-bold">{totalOrderBelumDiProses}</h2>
          </div>
        </div>
        <div className="flex bg-success-surface items-center p-[40px] rounded-[12px] space-x-[40px] shadow-md">
          <BsTruck size={50} className="text-black" />
          <div className="flex flex-col items-center space-y-[10px]">
            <div className="flex w-full space-x-[5px]">
              <p className="text-lg text-[16px] text-neutral-50 font-semibold">Total Truk</p>
              <p className="text-lg text-[16px] text-success-hover font-semibold">Tersedia</p>
            </div>
            <h2 className="w-full text-left text-black text-font-bold">{totalTrukTersedia}</h2>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAdmin