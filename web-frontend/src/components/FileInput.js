import { useState } from "react";
import { formatFileSize, getFileExtension } from "../utils/utils";
import { BsCloudUpload } from "react-icons/bs";
import { BsFiletypeCsv, BsFiletypeXls, BsFiletypeXlsx } from "react-icons/bs";

const FileInput = ({
    type = "",
    description = "Format yang didukung: CSV, XLS, XLSX", 
    onChange}) => {
    const [fileName, setFileName] = useState('');
    const [fileFormat, setFileFormat] = useState('');
    const [fileSize, setFileSize] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setFileFormat(getFileExtension(file.name));
            setFileSize(file.size);
        } else {
            setFileName('');
            setFileSize(null);
        }
        onChange(e);
    };

    const [userRole, setUserRole] = useState(localStorage.getItem("userRole"))
    const downloadUrl = `${process.env.PUBLIC_URL}/import_template`;

    return (
        <div className="">
            <label className="flex flex-col items-center justify-center font-PlusJakartaSans sm:max-w-screen-md md:w-screen border-2 border-primary border-dashed rounded-md cursor-pointer bg-lightgrey hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-12 pb-12">
                    <BsCloudUpload size={30}  className="m-2"/>
                    <p className="m-p-med">Klik untuk unggah file</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
            </label>
            <div className="text-left w-full mt-2 ml-2">
                <p className="s-p-reg">{description}</p>
                <p className="s-p-reg">Unduh template file
                {
                    type == "Truk" ? 
                        <a 
                        // href="https://docs.google.com/spreadsheets/d/1f1E5KXhLsKUzziWe7dgXkyehOqtT2rNo/edit?usp=sharing&ouid=103056808078707711552&rtpof=true&sd=true"
                        href={
                            userRole === 'Super' ?
                            `${downloadUrl}/SUPER_TEMPLATE_IMPORT_TRUK.csv` :
                            `${downloadUrl}/ABSOLUTE_TEMPLATE_IMPORT_TRUK.csv`
                        } download
                        target="_blank" 
                        rel="noopener noreferrer" className="text-primary"> <span className="underline">disini</span></a>
                    : 
                    type == "Lokasi" ? 
                        <a 
                        // href="https://docs.google.com/spreadsheets/d/1x7Zfcde7_7LCvSHlOzLX8UDedU7SweuAHGbx_o6dv1w/edit?usp=sharing"
                        href={
                            userRole === 'Super' ?
                            `${downloadUrl}/SUPER_TEMPLATE_IMPORT_LOKASI.csv` :
                            `${downloadUrl}/ADMIN_TEMPLATE_IMPORT_LOKASI.csv`
                        } download
                        target="_blank" 
                        rel="noopener noreferrer" className="text-primary"> <span className="underline">disini</span></a>
                    :
                    type == "Order" ? 
                        <a 
                        // href="https://docs.google.com/spreadsheets/d/1sJ7D6bmMCzHw6OJmpqrki5NFCGVpG-OR9vg9IuHXCCk/edit?usp=sharing"
                        href={
                            userRole === 'Super' ?
                            `${downloadUrl}/ALL_TEMPLATE_IMPORT_ORDER.csv` :
                            `${downloadUrl}/ALL_TEMPLATE_IMPORT_ORDER.csv`
                        } download
                        target="_blank" 
                        rel="noopener noreferrer" className="text-primary"> <span className="underline">disini</span></a>
                    :
                    null
                }
                </p>

                {(fileName && fileSize) && 
                    <div className="pt-8">
                        <p className="m-p-med">File terpilih:</p>
                        <div className="bg-neutral-20 p-6 rounded-lg flex flex-row">
                            {
                                fileFormat === 'csv' ?
                                    <BsFiletypeCsv size={35}/> :
                                fileFormat === 'xls' ?
                                    <BsFiletypeXls size={35}/>
                                :
                                    <BsFiletypeXlsx size={35}/>
                            }
                            <div className="pl-4">
                                <p className="m-p-med">{fileName}</p>
                                <p className="s-p-reg">{formatFileSize(fileSize)}</p>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
  };
  

export {FileInput};