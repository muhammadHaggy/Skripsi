import BaseTable, { SelectColumnFilter, StatusPill, ActionButtons } from "../../components/BaseTable";
import React, { useEffect, useState } from "react";
import { Loading } from "../../components/Loading";
import axiosAuthInstance from "../../utils/axios-auth-instance";

function dateFormat(date) {
  const etaDate = new Date(date);
  const year = etaDate.getFullYear();
  const month = String(etaDate.getMonth() + 1).padStart(2, "0");
  const day = String(etaDate.getDate()).padStart(2, "0");
  const formattedETA = `${day}-${month}-${year}`;
  return formattedETA;
}

function dateFormatDB(date) {
  const etaDate = new Date(date);
  const year = etaDate.getFullYear();
  const month = String(etaDate.getMonth() + 1).padStart(2, "0");
  const day = String(etaDate.getDate()).padStart(2, "0");
  const formattedETA = `${year}-${month}-${day}`;
  return formattedETA;
}

function ViewAllOrder() {
    const [dataOrder, setDataOrder] = useState([]);
    const [showLoading, setShowLoading] = useState(true); 
    const [orderEg, setOrderEg] = useState();
    const [todayIsNull, setTodayIsNull] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date());
    const dc_id= localStorage.getItem("dcId");  
    const userRole= localStorage.getItem("userRole");    

    useEffect(() => {
      setShowLoading(true);
      const formattedDate = dateFormatDB(selectedDate);
      if (userRole === "Super"){
        axiosAuthInstance.get(`/api/orders`, {
          params: {
            order_date: formattedDate
          }
        })
        .then((response) => {
          setDataOrder(response.data.data);
          setShowLoading(false);
          if (response.data.data.length > 0) {
              setOrderEg(response.data.data[0]);
          }
          else if(dateFormat(new Date()) == dateFormat(selectedDate)){
            setTodayIsNull(true);
          }
          else if(dateFormat(new Date()) !== dateFormat(selectedDate)){
            setTodayIsNull(false);
          }
        });
      }else{
        axiosAuthInstance.get(`/api/orders`, {
          params: {
            dc_id: dc_id,
            order_date: formattedDate
          }
        })
        .then((response) => {
          setDataOrder(response.data.data);
          setShowLoading(false);
          if (response.data.data.length > 0) {
              setOrderEg(response.data.data[0]);
          }
          else if(dateFormat(new Date()) == dateFormat(selectedDate)){
            setTodayIsNull(true);
          }
          else if(dateFormat(new Date()) !== dateFormat(selectedDate)){
            setTodayIsNull(false);
          }
        });
      };
  }, [selectedDate, todayIsNull]);

    const columns = React.useMemo(
        () => [
          {
            id: "order_num",
            Header: "Nomor Order",
            accessor: "order_num",
            Cell: props => {
              const { original } = props.cell.row;
              return ( <>
                <div
                    style={{
                      textAlign:"left",
                    }}
                  >{props.value}</div> </>
              )
            },
          },
          {
            Header: "Tanggal Order",
            accessor: "order_date",
            Filter: SelectColumnFilter,  
            filter: 'includes',
            Cell: props => {
              const etaDate = new Date(props.value);
              const year = etaDate.getFullYear();
              const month = String(etaDate.getMonth() + 1).padStart(2, "0");
              const day = String(etaDate.getDate()).padStart(2, "0");
              const formattedETA = `${day}-${month}-${year}`;
              return formattedETA;
            },
          },
          {
            Header: "Asal",
            accessor: "loc_ori.name",
            Filter: SelectColumnFilter,
            filter: 'includes',
          },
          {
            Header: "Destinasi",
            accessor: "loc_dest.name",
            Filter: SelectColumnFilter,  
            filter: 'includes',
          },
          {
            Header: "Volume (ml)",
            accessor: "volume",
            Filter: SelectColumnFilter,  
            filter: 'includes',
          },
          {
            Header: props => {
              return ( <>
                <div className="flex justify-center items-center text-center"
                  >Status</div> </>
              )
            },
            accessor: "status",
            Cell: props => {
                return ( <>
                  <div className="flex justify-center items-center"
                    >{StatusPill({value: props.value, type: "Order"})}</div> </>
                )
              },
          },
          {
            id: "action",
            Header: "Action",
            accessor: (row) => [
              "Order",
              row.id
            ],
            Cell: ActionButtons
          },
        ],
        []
      );

    return (
      <>
        <Loading visibility={showLoading} />
        <div className={`px-[50px] py-[30px] ${showLoading ? "hidden" : "visible"}`}>
            <BaseTable columns={columns} data={dataOrder} dataLength={dataOrder.length} orderTable={true} judul={`Order`} selectedDate={selectedDate} onDateChange={setSelectedDate} orderDate={orderEg!= null? dateFormat(orderEg.order_date) : null} todayIsNull={todayIsNull}/>
        </div>
      </>
    )
}

export default ViewAllOrder;