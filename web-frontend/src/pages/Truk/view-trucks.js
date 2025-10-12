import BaseTable, { SelectColumnFilter, StatusPill, ActionButtons } from "../../components/BaseTable";
import React, { useEffect, useState } from "react";
import { Loading } from "../../components/Loading";
import axiosAuthInstance from "../../utils/axios-auth-instance";
import jwtDecode from "jwt-decode";

function ViewTrucks() {
  const [dataTruk, setDataTruk] = useState([]);
  const [showLoading, setShowLoading] = useState(true); 
  const [userRole, setUserRole] = useState('');
 
  
  useEffect(() => {
    const tokenFromSession = sessionStorage.getItem('token');
    if (tokenFromSession) {
        const decodedToken = jwtDecode(tokenFromSession);
        setUserRole(decodedToken.role.name);
    }
  }, []); // Dependensi kosong agar hanya dijalankan sekali saat komponen dimuat

    useEffect(() => {
        if (userRole !== "Super" && dataTruk.length === 0) {
            axiosAuthInstance.get("/trucks")
                .then((response) => {
                    setDataTruk(response.data.data);
                    setShowLoading(false);

                })
                .catch((error) => {
                    console.error("Error fetching trucks:", error);
                    setShowLoading(false);
                });
        }
    }, [userRole, dataTruk]); // Bergantung pada userRole dan dataTruk

  const columns = React.useMemo(
      () => [
        {
          Header: "ID Truk",
          accessor: "id",
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
          Header: "Pelat",
          accessor: "plate_number",
          Filter: SelectColumnFilter,  
          filter: 'includes',
        },
        {
          Header: "Tipe",
          accessor: "truck_type.name",
          filter: 'includes',
          Cell: props => {
            const truckTypeName = props.value;
            let displayName = truckTypeName;
            if (truckTypeName === "BLIND_VAN") displayName = "Blind Van";
            else if (truckTypeName === "CDE") displayName = "CDE";
            else if (truckTypeName === "CDD") displayName = "CDD";
            return <div>{displayName}</div>;
          },
        },
        {
          Header: "DC",
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
          accessor: "first_status",
          Cell: props => {
            return ( <>
              <div className="flex justify-center items-center"
                >{StatusPill({value: props.value, type: "Truk"})}</div> </>
            )
          },
        },
        {
          Header: "Action",
          accessor: (row) => [
            "Truk",
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
          <BaseTable columns={columns} data={dataTruk} dataLength={dataTruk.length} judul={`Truk`}/>
        </div>
      </>
    )
}

export default ViewTrucks;