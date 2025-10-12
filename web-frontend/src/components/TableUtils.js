import React from "react";

export function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export function TableButton({ children, className, ...rest }) {
    return (
      <button
        type="button"
        className={classNames(
          "relative inline-flex items-center px-4 py-2 bg-opacity-0 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }
  
  export function PageButton({ children, className, ...rest }) {
    return (
      <button
        type="button"
        className={classNames(
          "relative inline-flex items-center px-2 py-2 bg-opacity-0 text-sm font-medium text-gray-500 hover:bg-gray-50",
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }