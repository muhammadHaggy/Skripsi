import BaseTable, { SelectColumnFilter, ActionButtons, StatusPill } from "../../components/BaseTable";
import React, { useEffect, useState } from "react";
import { Loading } from "../../components/Loading";
import axiosAuthInstance from "../../utils/axios-auth-instance";

function ViewAllPengiriman() {
    const [dataPengiriman, setDataPengiriman] = useState([]);
    const [showLoading, setShowLoading] = useState(true); 
    const dc_id= localStorage.getItem("dcId"); 
    const userRole= localStorage.getItem("userRole");    
    const [fetchDataPengiriman, setFetchDataPengiriman] = useState(false);
    const [refreshKey, setRefreshKey] = useState(Date.now());

    const forceRender = () => {
      setRefreshKey(Date.now());
    };

    useEffect(() => {
      // console.log(fetchDataPengiriman);
      if(userRole === "Super"){
        if (dataPengiriman.length === 0) {
          axiosAuthInstance.get("/api/shipments")
          .then((response) => {
            setDataPengiriman(response.data.data);
            setShowLoading(false)
          });
        }
      }else{
        if (dataPengiriman.length === 0) {
          axiosAuthInstance.get("/api/shipments",{
            params: {
              dc_id: dc_id
            }
          }).then((response) => {
            setDataPengiriman(response.data.data);
            setShowLoading(false)
          });
        }
      }
      
      if (fetchDataPengiriman === true) {
        setFetchDataPengiriman(false)
        window.location.reload();
      }
    }, [dataPengiriman, fetchDataPengiriman]);

    // useEffect(() => {
    //   const fetchData = () => {
    //     setShowLoading(true);
    //     const endpoint = userRole === "Super" ? "/api/shipments" : "/api/shipments";
    //     const params = userRole !== "Super" ? { dc_id: dc_id } : {};
    
    //     axiosAuthInstance.get(endpoint, { params })
    //       .then((response) => {
    //         setDataPengiriman(response.data.data);
    //         setShowLoading(false);
    //       })
    //       .catch((error) => {
    //         console.error("Error fetching data:", error);
    //         setShowLoading(false);
    //       })
    //       .finally(() => {
    //         setFetchDataPengiriman(false);
    //       });
    //   };
    
    //   if (fetchDataPengiriman) {
    //     fetchData();
    //     forceRender()
    //   }
    // }, [fetchDataPengiriman, userRole, dc_id]);

    const columns = React.useMemo(
        () => [
          {
            id: "id",
            Header: "Nomor Pengiriman",
            accessor: "shipment_num",
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
            Header: "ETA",
            accessor: "eta",
            Filter: SelectColumnFilter,  
            filter: 'includes',
            Cell: props => {
              if (props.value !== null){
                const date = new Date(props.value);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const formattedDate = `${day}-${month}-${year}`;
                return formattedDate;
              }
              else{
                return "-"
              }
            },
          },
          {
            Header: "Asal",
            accessor: "dc.name",
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
                    >{StatusPill({value: props.value, type: "Pengiriman"})}</div> </>
                )
            },
          },
          {
            id: "action",
            Header: "Action",
            accessor: (row) => [
              "Pengiriman",
              row.id
            ],
            Cell: props => {
              return ( <>
                <div>
                  {ActionButtons({value: props.value, refetchData: setFetchDataPengiriman})}
                </div> 
                </>
              )
            },
          },
        ],
        []
      );

    return (
      <>
        <Loading visibility={showLoading} />
        <div className={`px-[50px] py-[30px] ${showLoading ? "hidden" : "visible"}`}>
            <BaseTable key={refreshKey} columns={columns} data={dataPengiriman} dataLength={dataPengiriman.length} judul={`Pengiriman`}/>
        </div>
      </>
    )
}

export default ViewAllPengiriman;