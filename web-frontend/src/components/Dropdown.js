import { Listbox, Transition } from '@headlessui/react';
import '../App.css';
import React, { Fragment } from 'react';
import { BiSolidErrorCircle, BiSolidDownArrow } from 'react-icons/bi';

const Dropdown = ({
    data,
    label = "Insert label",
    helper = null,
    placeholder,
    className,
    value = null,
    onChange,
    isError = false,
    required = false,
    disabled = false}) => {
        return( 
            <div className="sm:col-span-3 p-2">
                <label htmlFor="order-name" className="block m-p-med leading-6">
                    {label} {required ? <span className="text-danger">*</span> : null}
                </label>

                <div className="mt-1">
                    <Listbox value={value == null ? null : value.value} onChange={onChange} disabled={disabled}>
                        <div className="relative mt-1">
                            <Listbox.Button className={`${className} relative min-w-[25%] cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left ring-1 ring-inset ${isError ? 'ring-danger' : "ring-neutral-40"} focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary disabled:bg-gray-200 disabled:placeholder-neutral-60 m-p-reg`}>
                                {
                                    value == null ?
                                    <span className="block truncate text-neutral-40">{placeholder}</span>
                                    : 
                                    <span className="block truncate">{value.name}</span>
                                }
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <BiSolidDownArrow
                                        aria-hidden="true"
                                    />
                                </span>
                            </Listbox.Button>
                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="absolute z-10 mt-1 min-w-[25%] max-h-[100px] overflow-auto overflow-y-scroll rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {data.map((order, orderIdx) => (
                                    <Listbox.Option
                                    key={orderIdx}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-primary text-white' : 'text-gray-900'
                                        }`
                                    }
                                    value={order}
                                    >
                                    {({ value }) => (
                                        <>
                                        <span
                                            className={`block truncate ${
                                                value ? 'font-medium' : 'font-normal'
                                            }`}
                                        >
                                            {order.name}
                                        </span>
                                        {value ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                            {/* <CheckIcon className="h-5 w-5" aria-hidden="true" /> */}
                                            </span>
                                        ) : null}
                                        </>
                                    )}
                                    </Listbox.Option>
                                ))}
                                </Listbox.Options>
                            </Transition>
                        </div>
                    </Listbox>
                    {
                        isError ?
                        <div className="flex items-center text-neutral-60">
                            <BiSolidErrorCircle className='text-danger'/>
                            <p className="pl-1 leading-6 s-p-med text-danger">{`Kolom ${label.toLowerCase()} harus diisi.`}</p>
                        </div> :
                        helper === null ? null :
                        <div className="flex items-center text-neutral-60">
                            <BiSolidErrorCircle />
                            <p className="pl-1 leading-6 s-p-med">{helper}</p>
                        </div> 
                    }
                </div>
            </div>
        )
}

const MultipleDropdown = ({
    data,
    label = "Insert label",
    helper = null,
    placeholder,
    className,
    value = null,
    onChange,
    isError = false,
    required = false,
    disabled = false}) => {

        function isSelected(selected) {
            return value.find((el) => el.value === selected.value) ? true : false;
        }
        
        function handleSelect(selected) {
            if (!isSelected(selected)) {
                const valueUpdate = [
                    ...value,
                    data.find((el) => el === selected)
                ];
                onChange(valueUpdate);
            } else {
                handleDeselect(selected);
            }
        }
    
        function handleDeselect(selected) {
            const valueUpdate = value.filter((el) => el.value !== selected.value);
            onChange(valueUpdate);
        }

        return( 
            <div className="sm:col-span-3 p-2">
                <label htmlFor="order-name" className="block m-p-med leading-6">
                    {label} {required ? <span className="text-danger">*</span> : null}
                </label>

                <div className="mt-1">
                    <Listbox value={value[0] == null ? null : value} onChange={(newSelected) => handleSelect(newSelected)} disabled={disabled}>
                        <div className="relative mt-1 disabled:text-neutral-60">
                            <Listbox.Button className={`${className} relative w-[25%] cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left ring-1 ring-inset ${isError ? 'ring-danger' : "ring-neutral-40"} focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary disabled:bg-neutral-30 disabled:placeholder-neutral-60 disabled:text-neutral-60 m-p-reg`}>
                                {
                                    value[0] == null ?
                                    <span className="block truncate text-neutral-40">{placeholder}</span>
                                    : 
                                    <span className="block truncate disabled:text-neutral-60">{value.map((data) => data.name).join(', ')}</span>
                                }
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <BiSolidDownArrow
                                        aria-hidden="true"
                                    />
                                </span>
                            </Listbox.Button>
                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="absolute z-10 mt-1 min-w-[25%] overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {data.map((order, orderIdx) => (
                                    <Listbox.Option
                                    key={orderIdx}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-primary text-white' : 'text-gray-900'
                                        }`
                                    }
                                    value={order}
                                    >
                                    {({ value }) => (
                                        <>
                                        <span
                                            className={`block truncate ${
                                                value ? 'font-medium' : 'font-normal'
                                            }`}
                                        >
                                            {order.name}
                                        </span>
                                        {value ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                            {/* <CheckIcon className="h-5 w-5" aria-hidden="true" /> */}
                                            </span>
                                        ) : null}
                                        </>
                                    )}
                                    </Listbox.Option>
                                ))}
                                </Listbox.Options>
                            </Transition>
                        </div>
                    </Listbox>
                    {
                        isError ?
                        <div className="flex items-center text-neutral-60">
                            <BiSolidErrorCircle className='text-danger'/>
                            <p className="pl-1 leading-6 s-p-med text-danger">{`Kolom ${label.toLowerCase()} harus diisi.`}</p>
                        </div> :
                        helper === null ? null :
                        <div className="flex items-center text-neutral-60">
                            <BiSolidErrorCircle />
                            <p className="pl-1 leading-6 s-p-med">{helper}</p>
                        </div> 
                    }
                </div>
            </div>
        )
}

export {Dropdown, MultipleDropdown};