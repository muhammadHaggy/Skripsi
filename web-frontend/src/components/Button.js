export default function Button({
    icon,
    label = "Insert label",
    onClick,
    className,
    disabled = false}){

        return( 
            <button type="button" className={`flex items-center justify-between ${className} space-x-2`} disabled={disabled} onClick={onClick}>
                <span className="flex-grow">{label}</span>
                {icon}
            </button>
        )
}

export {Button};