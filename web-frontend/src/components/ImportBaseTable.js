// import React, { useState, useEffect, forwardRef } from "react";
// import {
//     useTable,
//     useGlobalFilter,
//     useFilters,
//     useSortBy,
//     usePagination,
//     useRowSelect,
// } from "react-table";
// import { useRowSelectColumn } from "@lineup-lite/hooks";
// import { TableButton, PageButton, classNames } from "./TableUtils";
// import {
//     BsEye,
//     BsChevronExpand,
//     BsChevronDown,
//     BsChevronUp,
//     BsCalendarEvent
// } from "react-icons/bs";
// import { ModalDetailTruk, ModalDetailLokasi, ModalDetailOrder, ModalDetailLokasiFailed } from "./Modal";
// import { GlobalFilter } from "./BaseTable";
// import DatePicker from "react-datepicker";

// export function ActionButtons({ value }) {
//     const [page, setPage] = useState(null);
//     const [item, setItem] = useState(null);
    
//     const [isOpenDetailLocation, setIsOpenDetailLocation] = useState(false); 
//     const [isOpenDetailTruk, setIsOpenDetailTruk] = useState(false); 
//     const [isOpenDetailOrder, setIsOpenDetailOrder] = useState(false); 
    
//     const [lokasiData, setLokasiData] = useState({
//         name: null,
//         address: null,
//         desa_kelurahan: null,
//         kecamatan: null,
//         kabupaten_kota: null,
//         provinsi: null,
//         kode_pos: null,
//         // latitude: null,
//         // longitude: null,
//         open_hour: null,
//         close_hour: null,
//         // company: null,
//         updated_by: null,
//         dc: null,
//         loc_id: null,
//         service_time: null,
//         location_type: null
//       });

//     const [trukData, setTrukData] = useState({
//         id: null,
//         plate_number: null,
//         type: null,
//         company_name: null,
//         dc: null,
//         status: null,
//         max_individual_capacity_volume: null
//       });

//     const [orderData, setOrderData] = useState({
//         order_num: null,
//         description: null,
//         volume: null,
//         quantity: null,
//         eta: null,
//         eta_target: null,
//         company: null,
//         dc: null,
//     });

//     useEffect(() => {
//         setPage(value[0])
//         setItem(value[1])
//     }, [])

//     useEffect(() => {
//         async function fetchDataLokasi() {
//             if (lokasiData.name === null && page === 'Lokasi') {
//                 try {    
//                 const lokasiData = {
//                     name: item.name,
//                     address: item.address,
//                     desa_kelurahan: item.desa_kelurahan,
//                     kecamatan: item.kecamatan,
//                     kabupaten_kota: item.kabupaten_kota,
//                     provinsi: item.provinsi,
//                     kode_pos: item.kode_pos,
//                     // latitude: item.latitude,
//                     // longitude: item.longitude,
//                     open_hour: item.open_hour,
//                     close_hour: item.close_hour,
//                     // company: item.company,
//                     updated_by: item.updated_by,
//                     dc: item.dc,
//                     loc_id: item.loc_id,
//                     service_time: item.service_time,
//                     location_type: item.location_type
//                 };
        
//                 setLokasiData(lokasiData);
//                 } catch (error) {
//                 console.error("Error fetching data:", error);
//                 }
//             }
//         };

//         async function fetchDataTruk() {
//             if (trukData.plate_number === null && page === 'Truk') {
//               try {      
//                 const trukData = {
//                   id: item.id,
//                   plate_number: item.plate_number,
//                   type: item.type,
//                   company_name: item.company,
//                   dc: item.dc,
//                   status: item.status,
//                   max_individual_capacity_volume: item.max_individual_capacity_volume
//                 };
      
//                 setTrukData(trukData);    
//               } catch (error) {
//                 console.error("Error fetching data:", error);
//               }
//             }
//           };

//         async function fetchDataOrder() {
//         if (orderData.order_num === null && page === 'Order') {
//             try {
//             const orderData = {
//                 order_num: item.order_num,
//                 description: item.description,
//                 volume: item.volume,
//                 quantity: item.quantity,
//                 eta: item.eta,
//                 eta_target: item.eta_target,
//                 dc: item.dc,
//                 company: item.company_dest,
//             };
//             setOrderData(orderData);    
            
//             } catch (error) {
//             console.error("Error fetching data:", error);
//             }
//         }
//         };

//         fetchDataTruk();
//         fetchDataLokasi();
//         fetchDataOrder();
//     }, [lokasiData, trukData, orderData, item]);
//     return (
//         <>  
//             {
//                 lokasiData.id === null ? null :
//                 <ModalDetailLokasi importTable={true} isOpen={isOpenDetailLocation} closeModal={() => setIsOpenDetailLocation(false)} lokasi={lokasiData}/>
//             }
//             {
//                 trukData.id === null ? null :
//                 <ModalDetailTruk importTable={true} isOpen={isOpenDetailTruk} closeModal={() => setIsOpenDetailTruk(false)} truk={trukData}/>
//             }
//             {
//                 orderData.id === null ? null :
//                 <ModalDetailOrder importTable={true} isOpen={isOpenDetailOrder} closeModal={() => setIsOpenDetailOrder(false)} order={orderData}/>
//             }
//             <div className="flex space-x-[10px]">
                
//                 <BsEye className="cursor-pointer" 
//                     title={`View Detail ${page}`}
//                     onClick={
//                             page === "Lokasi" ?
//                             () => setIsOpenDetailLocation(true) :
//                             page == "Truk" ?
//                             () => setIsOpenDetailTruk(true):
//                             page == "Order" ?
//                             () => setIsOpenDetailOrder(true)
//                             : null
//                         }
//                 ></BsEye>
//             </div>
//         </>
//     );
// }

// export function ActionButtonsFailed({ value }) {
//     const [page, setPage] = useState(null);
//     const [item, setItem] = useState(null);
    
//     const [isOpenDetailLocation, setIsOpenDetailLocation] = useState(false); 
    
//     const [lokasiData, setLokasiData] = useState({
//         name: null,
//         loc_id: null,
//         address: null,
//         message: null
//       });

//     useEffect(() => {
//         setPage(value[0])
//         setItem(value[1])
//     }, [])

//     useEffect(() => {
//         async function fetchDataLokasi() {
//             if (lokasiData.name === null && page === 'Lokasi') {
//                 try {    
//                 const lokasiData = {
//                     name: item.name,
//                     loc_id: item.loc_id,
//                     address: item.address,
//                     message: item.message
//                 };
        
//                 setLokasiData(lokasiData);
//                 } catch (error) {
//                 console.error("Error fetching data:", error);
//                 }
//             }
//         };

//         fetchDataLokasi();
//     }, [lokasiData, item]);
//     return (
//         <>  
//             {
//                 lokasiData.id === null ? null :
//                 <ModalDetailLokasiFailed importTable={true} isOpen={isOpenDetailLocation} closeModal={() => setIsOpenDetailLocation(false)} lokasi={lokasiData}/>
//             }
            
//             <div className="flex space-x-[10px]">
                
//                 <BsEye className="cursor-pointer" 
//                     title={`View Detail ${page}`}
//                     onClick={
//                             page === "Lokasi" ?
//                             () => setIsOpenDetailLocation(true)
//                             : null
//                         }
//                 ></BsEye>
//             </div>
//         </>
//     );
// }

// function dateFormat(date) {
//     const etaDate = new Date(date);
//     const year = etaDate.getFullYear();
//     const month = String(etaDate.getMonth() + 1).padStart(2, "0");
//     const day = String(etaDate.getDate()).padStart(2, "0");
//     const formattedETA = `${day}-${month}-${year}`;
//     return formattedETA;
// }

// export function ImportBaseTable({ columns, data, dataLength= 0, judul, onDataSelected, selectedDate, onDateChange, selectOrderPengiriman=false}) {
//     const {
//         getTableProps,
//         getTableBodyProps,
//         headerGroups,
//         prepareRow,
//         page,
//         canPreviousPage,
//         canNextPage,
//         pageOptions,
//         pageCount,
//         gotoPage,
//         nextPage,
//         previousPage,
//         setPageSize,
//         state,
//         preGlobalFilteredRows,
//         setGlobalFilter,
//     } = useTable(
//         { columns, data },
//         useGlobalFilter,
//         useFilters,
//         useSortBy,
//         usePagination,
//         useRowSelect,
//         useRowSelectColumn
//     );

//     const [prevSelectedRowIds, setPrevSelectedRowIds] = useState({});

//     useEffect(() => {
//         const prevIds = Object.keys(prevSelectedRowIds);
//         const currentIds = Object.keys(state.selectedRowIds);

//         const addedIds = currentIds.filter((id) => !prevIds.includes(id));
//         const removedIds = prevIds.filter((id) => !currentIds.includes(id));

//         if (addedIds.length > 0 || removedIds.length > 0) {
//             const selectedData = getSelected();
//             onDataSelected(selectedData);
//         }

//         setPrevSelectedRowIds(state.selectedRowIds);
//     }, [state.selectedRowIds]);

//     let totalSelected = Object.entries(state.selectedRowIds).length;
    
//     function getSelected() {
//         const list = Object.entries(state.selectedRowIds);
//         let selectedData = [];
//         for (let i = 0; i < list.length; i++) {
//             for (let j = 0; j < data.length; j++) {
//                 if (list[i][0] === String(j)) {
//                     selectedData.push(data[j]);
//                 }
//             }
//         }
//         return selectedData;
//     }

//     const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
//         <div className="example-custom-input px-4 py-3 bg-neutral-10 rounded-[7px] flex items-center border border-neutral-40" 
//         onClick={onClick} 
//         ref={ref}
//         >
//             <BsCalendarEvent className="mr-[10px]"></BsCalendarEvent>
//             {value}
//         </div>
//     ));

//     return (
//         <>
//         {selectOrderPengiriman ? 
//             <>
//             <div className="flex items-end justify-between">
//                 <div className="space-y-[10px] flex-col">
//                     <p className="font-semibold text-[16px]">Pilih Tanggal Order</p>
//                     <div className="flex space-x-[10px] cursor-pointer">
//                         <DatePicker 
//                             selected={selectedDate}
//                             onChange={onDateChange}
//                             dateFormat="dd-MM-yyyy"
//                             customInput={<ExampleCustomInput />}
                            
//                         />
//                     </div>
//                 </div>
//                 <div className="ml-auto">
//                     <GlobalFilter
//                         preGlobalFilteredRows={preGlobalFilteredRows}
//                         globalFilter={state.globalFilter}
//                         setGlobalFilter={setGlobalFilter}
//                     />
//                 </div>
//             </div>
//             <div className="flex justify-between">
//                 <p className="font-semibold text-[16px] text-primary">*Menampilkan order tanggal {dateFormat(selectedDate)}</p> 
//                 <p className="text-table-info text-right pt-2">{`#${totalSelected} ${judul} Terpilih`}</p>
//             </div>
//             </>
//         :
//             <div className="items-center justify-between">
//                 <div className="flex">
//                     <div className="ml-auto">
//                         <GlobalFilter
//                             preGlobalFilteredRows={preGlobalFilteredRows}
//                             globalFilter={state.globalFilter}
//                             setGlobalFilter={setGlobalFilter}
//                         />

//                         <p className="text-table-info text-right pt-2">{`#${totalSelected} ${judul} Terpilih`}</p>
//                     </div>
//                 </div>
//             </div>
//         }
//             {dataLength > 0 ? (
//                 pageOptions.length !== 0 ? (
//                     <>
//                         <div className="mt-[20px] flex flex-col">
//                             <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
//                                 <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
//                                     <div className="overflow-hidden border-b border-gray-200 rounded-sm">

//                                         <table
//                                             {...getTableProps()}
//                                             className="min-w-full" 
//                                         >
//                                             <thead className="">
//                                                 {headerGroups.map(
//                                                     (headerGroup) => (
//                                                         <tr
//                                                             {...headerGroup.getHeaderGroupProps()}
//                                                         >
//                                                             {headerGroup.headers.map(
//                                                                 (column) => (
//                                                                     <th
//                                                                         scope="col"
//                                                                         className="px-[10px] py-3 text-left text-black font-semibold text-[16px] tracking-wider border-[1px] border-primary-border"
//                                                                         {...column.getHeaderProps(
//                                                                             column.getSortByToggleProps()
//                                                                         )}
//                                                                     >
//                                                                         {column.render(
//                                                                             "Header"
//                                                                         )}
//                                                                         {column.id ===
//                                                                             "selection" &&
//                                                                             column.render(
//                                                                                 "Summary"
//                                                                             )}
//                                                                         <span>
//                                                                             {column.render("Header") == "ID Truk" ||
//                                                                             column.render("Header") == "Pelat" ||
//                                                                             column.render("Header") == "Tipe" ||
//                                                                             column.render("Header") == "DC" ||
//                                                                             column.render("Header") == "ID Lokasi" ||
//                                                                             column.render("Header") == "Nama Lokasi" ||
//                                                                             column.render("Header") == "Alamat" ||
//                                                                             column.render("Header") == "Status" ||
//                                                                             column.render("Header") == "Tipe Kendaraan" ||
//                                                                             column.render("Header") == "Perusahaan" ? 
//                                                                                 (
//                                                                                     column.isSorted ? (
//                                                                                         column.isSortedDesc ? (
//                                                                                             <BsChevronDown className="ml-2 inline-block"></BsChevronDown>
//                                                                                         ) : (
//                                                                                             <BsChevronUp className=" ml-2 inline-block" ></BsChevronUp>
//                                                                                         )
//                                                                                     ) : (
//                                                                                         <BsChevronExpand className=" ml-2 inline-block" ></BsChevronExpand>
//                                                                                     )
//                                                                                 ) : null}
//                                                                         </span>
//                                                                     </th>
//                                                                 )
//                                                             )}
//                                                         </tr>
//                                                     )
//                                                 )}
//                                             </thead>
//                                             <tbody
//                                                 {...getTableBodyProps()}
//                                                 className="bg-neutral-10 divide-y divide-gray-200 "
//                                             >
//                                                 {page.map((row, i) => {
//                                                     prepareRow(row);
//                                                     // onClick(row);
//                                                     return (
//                                                         <tr
//                                                             {...row.getRowProps()}
//                                                         >
//                                                             {row.cells.map(
//                                                                 (cell) => {
//                                                                     return (
//                                                                         <td
//                                                                             {...cell.getCellProps()}
//                                                                             className="pl-[0.6rem] pr-3 py-3 text-neutral-90 max-w-[100px] text-left text-m break-all truncate"
//                                                                         >
//                                                                             {cell.render(
//                                                                                 "Cell"
//                                                                             )}
//                                                                         </td>
//                                                                     );
//                                                                 }
//                                                             )}
//                                                         </tr>
//                                                     );
//                                                 })}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="py-3 flex items-center justify-between">
//                             <div className="flex-1 flex justify-between sm:hidden">
//                                 <TableButton
//                                     onClick={() => previousPage()}
//                                     disabled={!canPreviousPage}
//                                 >
//                                     Previous
//                                 </TableButton>
//                                 <TableButton
//                                     onClick={() => nextPage()}
//                                     disabled={!canNextPage}
//                                 >
//                                     Next
//                                 </TableButton>
//                             </div>
//                             <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                                 <div className="flex space-x-2 ml-2 mb-3 mt-2 sm:items-center sm:justify-between">
//                                     <span className="text-sm text-gray-700">
//                                         Halaman
//                                         <span className="font-medium">
//                                             {" "}
//                                             {state.pageIndex + 1}
//                                         </span>{" "}
//                                         dari
//                                         <span className="font-medium">
//                                             {" "}
//                                             {pageOptions.length}
//                                         </span>{" "}
//                                         | {" Total "}{" "}
//                                         {preGlobalFilteredRows.length} |
//                                         Tampilkan
//                                     </span>
//                                     <label>
//                                         <select
//                                             className="p-1 block w-full bg-opacity-25 rounded-[8px] border border-primary-hover text-primary-hover font-semibold text-sm"
//                                             value={state.pageSize}
//                                             onChange={(e) => {
//                                                 setPageSize(
//                                                     Number(e.target.value)
//                                                 );
//                                             }}
//                                         >
//                                             {[5, 10, 30].map((pageSize) => (
//                                                 <option
//                                                     key={pageSize}
//                                                     value={pageSize}
//                                                 >
//                                                     {pageSize}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </label>
//                                 </div>
//                                 <div>
//                                     <nav
//                                         className="relative mr-1 z-0 inline-flex -space-x-px"
//                                         aria-label="Pagination"
//                                     >
//                                         <PageButton
//                                             className="rounded-[5px]"
//                                             onClick={() => gotoPage(0)}
//                                             disabled={!canPreviousPage}
//                                         >
//                                             <span className="sr-only">
//                                                 First
//                                             </span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </PageButton>
//                                         <PageButton
//                                             className="rounded-[5px]"
//                                             onClick={() => previousPage()}
//                                             disabled={!canPreviousPage}
//                                         >
//                                             <span className="sr-only">
//                                                 Previous
//                                             </span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </PageButton>
//                                         <PageButton
//                                             className="rounded-[5px]"
//                                             onClick={() => nextPage()}
//                                             disabled={!canNextPage}
//                                         >
//                                             <span className="sr-only">
//                                                 Next
//                                             </span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </PageButton>
//                                         <PageButton
//                                             className="rounded-[5px]"
//                                             onClick={() =>
//                                                 gotoPage(pageCount - 1)
//                                             }
//                                             disabled={!canNextPage}
//                                         >
//                                             <span className="sr-only">
//                                                 Last
//                                             </span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </PageButton>
//                                     </nav>
//                                 </div>
//                             </div>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex flex-col items-center">
//                         {/* <img src={pageNotFound} alt="" className="w-[350px]" /> */}
//                         <span className="flex flex-col items-center">
//                             <p>Mohon Maaf</p>
//                             <p>
//                                 Pencarian tidak ditemukan. Silakan mencari kata
//                                 kunci lain.
//                             </p>
//                         </span>
//                     </div>
//                 )
//             )  
//             :judul == "Order"?(
//                 <div className="flex flex-col items-center">
//                     <p className="font-[500]">Tidak Ada Data</p>
//                     <p>Tidak ada data order untuk tanggal {dateFormat(selectedDate)}</p>
//                 </div>
//             )
//             :
//             (
//                 <div className="flex flex-col items-center">
//                     <p className="font-[500]">Tidak Ada Data</p>
//                     <p>Belum ada data yang dapat ditampilkan di halaman ini.</p>
//                 </div>
//             )}
//         </>
//     );
// }

// export function ImportBaseTableFailed({ columns, data, dataLength= 0, judul, onDataSelected, selectedDate, onDateChange, selectOrderPengiriman=false}) {
//     const {
//         getTableProps,
//         getTableBodyProps,
//         headerGroups,
//         prepareRow,
//         page,
//         canPreviousPage,
//         canNextPage,
//         pageOptions,
//         pageCount,
//         gotoPage,
//         nextPage,
//         previousPage,
//         setPageSize,
//         state,
//         preGlobalFilteredRows,
//         setGlobalFilter,
//     } = useTable(
//         { columns, data },
//         useGlobalFilter,
//         useFilters,
//         useSortBy,
//         usePagination,
//         useRowSelect,
//         // useRowSelectColumn
//     );

//     return (
//         <>
       
//         <div className="items-center justify-between">
//             <div className="flex">
//                 <div className="ml-auto">
//                     <GlobalFilter
//                         preGlobalFilteredRows={preGlobalFilteredRows}
//                         globalFilter={state.globalFilter}
//                         setGlobalFilter={setGlobalFilter}
//                     />
//                 </div>
//             </div>
//         </div>
//             {dataLength > 0 ? (
//                 pageOptions.length !== 0 ? (
//                     <>
//                         <div className="mt-[20px] flex flex-col">
//                             <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
//                                 <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
//                                     <div className="overflow-hidden border-b border-gray-200 rounded-sm">

//                                         <table
//                                             {...getTableProps()}
//                                             className="min-w-full" 
//                                         >
//                                             <thead className="">
//                                                 {headerGroups.map(
//                                                     (headerGroup) => (
//                                                         <tr
//                                                             {...headerGroup.getHeaderGroupProps()}
//                                                         >
//                                                             {headerGroup.headers.map(
//                                                                 (column) => (
//                                                                     <th
//                                                                         scope="col"
//                                                                         className="px-[10px] py-3 text-left text-black font-semibold text-[16px] tracking-wider border-[1px] border-primary-border"
//                                                                         {...column.getHeaderProps(
//                                                                             column.getSortByToggleProps()
//                                                                         )}
//                                                                     >
//                                                                         {column.render(
//                                                                             "Header"
//                                                                         )}
//                                                                         {column.id ===
//                                                                             "selection" &&
//                                                                             column.render(
//                                                                                 "Summary"
//                                                                             )}
//                                                                         <span>
//                                                                             {column.render("Header") == "ID Truk" ||
//                                                                             column.render("Header") == "Pelat" ||
//                                                                             column.render("Header") == "Tipe" ||
//                                                                             column.render("Header") == "DC" ||
//                                                                             column.render("Header") == "ID Lokasi" ||
//                                                                             column.render("Header") == "Nama Lokasi" ||
//                                                                             column.render("Header") == "Alamat" ||
//                                                                             column.render("Header") == "Status" ||
//                                                                             column.render("Header") == "Tipe Kendaraan" ||
//                                                                             column.render("Header") == "Perusahaan" ? 
//                                                                                 (
//                                                                                     column.isSorted ? (
//                                                                                         column.isSortedDesc ? (
//                                                                                             <BsChevronDown className="ml-2 inline-block"></BsChevronDown>
//                                                                                         ) : (
//                                                                                             <BsChevronUp className=" ml-2 inline-block" ></BsChevronUp>
//                                                                                         )
//                                                                                     ) : (
//                                                                                         <BsChevronExpand className=" ml-2 inline-block" ></BsChevronExpand>
//                                                                                     )
//                                                                                 ) : null}
//                                                                         </span>
//                                                                     </th>
//                                                                 )
//                                                             )}
//                                                         </tr>
//                                                     )
//                                                 )}
//                                             </thead>
//                                             <tbody
//                                                 {...getTableBodyProps()}
//                                                 className="bg-neutral-10 divide-y divide-gray-200 "
//                                             >
//                                                 {page.map((row, i) => {
//                                                     prepareRow(row);
//                                                     // onClick(row);
//                                                     return (
//                                                         <tr
//                                                             {...row.getRowProps()}
//                                                         >
//                                                             {row.cells.map(
//                                                                 (cell) => {
//                                                                     return (
//                                                                         <td
//                                                                             {...cell.getCellProps()}
//                                                                             className="pl-[0.6rem] pr-3 py-3 text-neutral-90 max-w-[100px] text-left text-m break-all truncate"
//                                                                         >
//                                                                             {cell.render(
//                                                                                 "Cell"
//                                                                             )}
//                                                                         </td>
//                                                                     );
//                                                                 }
//                                                             )}
//                                                         </tr>
//                                                     );
//                                                 })}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="py-3 flex items-center justify-between">
//                             <div className="flex-1 flex justify-between sm:hidden">
//                                 <TableButton
//                                     onClick={() => previousPage()}
//                                     disabled={!canPreviousPage}
//                                 >
//                                     Previous
//                                 </TableButton>
//                                 <TableButton
//                                     onClick={() => nextPage()}
//                                     disabled={!canNextPage}
//                                 >
//                                     Next
//                                 </TableButton>
//                             </div>
//                             <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                                 <div className="flex space-x-2 ml-2 mb-3 mt-2 sm:items-center sm:justify-between">
//                                     <span className="text-sm text-gray-700">
//                                         Halaman
//                                         <span className="font-medium">
//                                             {" "}
//                                             {state.pageIndex + 1}
//                                         </span>{" "}
//                                         dari
//                                         <span className="font-medium">
//                                             {" "}
//                                             {pageOptions.length}
//                                         </span>{" "}
//                                         | {" Total "}{" "}
//                                         {preGlobalFilteredRows.length} |
//                                         Tampilkan
//                                     </span>
//                                     <label>
//                                         <select
//                                             className="p-1 block w-full bg-opacity-25 rounded-[8px] border border-primary-hover text-primary-hover font-semibold text-sm"
//                                             value={state.pageSize}
//                                             onChange={(e) => {
//                                                 setPageSize(
//                                                     Number(e.target.value)
//                                                 );
//                                             }}
//                                         >
//                                             {[5, 10, 30].map((pageSize) => (
//                                                 <option
//                                                     key={pageSize}
//                                                     value={pageSize}
//                                                 >
//                                                     {pageSize}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </label>
//                                 </div>
//                                 <div>
//                                     <nav
//                                         className="relative mr-1 z-0 inline-flex -space-x-px"
//                                         aria-label="Pagination"
//                                     >
//                                         <PageButton
//                                             className="rounded-[5px]"
//                                             onClick={() => gotoPage(0)}
//                                             disabled={!canPreviousPage}
//                                         >
//                                             <span className="sr-only">
//                                                 First
//                                             </span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </PageButton>
//                                         <PageButton
//                                             className="rounded-[5px]"
//                                             onClick={() => previousPage()}
//                                             disabled={!canPreviousPage}
//                                         >
//                                             <span className="sr-only">
//                                                 Previous
//                                             </span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </PageButton>
//                                         <PageButton
//                                             className="rounded-[5px]"
//                                             onClick={() => nextPage()}
//                                             disabled={!canNextPage}
//                                         >
//                                             <span className="sr-only">
//                                                 Next
//                                             </span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </PageButton>
//                                         <PageButton
//                                             className="rounded-[5px]"
//                                             onClick={() =>
//                                                 gotoPage(pageCount - 1)
//                                             }
//                                             disabled={!canNextPage}
//                                         >
//                                             <span className="sr-only">
//                                                 Last
//                                             </span>
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-5 w-5"
//                                                 viewBox="0 0 20 20"
//                                                 fill="currentColor"
//                                             >
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </PageButton>
//                                     </nav>
//                                 </div>
//                             </div>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex flex-col items-center">
//                         {/* <img src={pageNotFound} alt="" className="w-[350px]" /> */}
//                         <span className="flex flex-col items-center">
//                             <p>Mohon Maaf</p>
//                             <p>
//                                 Pencarian tidak ditemukan. Silakan mencari kata
//                                 kunci lain.
//                             </p>
//                         </span>
//                     </div>
//                 )
//             )  
//             :
//             (
//                 <div className="flex flex-col items-center">
//                     <p className="font-[500]">Tidak Ada Data</p>
//                     <p>Belum ada data yang dapat ditampilkan di halaman ini.</p>
//                 </div>
//             )}
//         </>
//     );
// }

// export default [ImportBaseTable, ImportBaseTableFailed] ;