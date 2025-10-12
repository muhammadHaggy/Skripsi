import { Switch } from "@headlessui/react";

const Toggle = ({
    label = "Insert label",
    value = null,
    onChange,}) => {

        return( 
            <Switch.Group>
                <div className="flex items-center">
                    <Switch
                    checked={value}
                    onChange={onChange}
                    className={`${
                        value ? 'bg-success' : 'bg-danger'
                    } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none`}
                    >
                    <span
                        className={`${
                            value ? 'translate-x-5' : 'translate-x-1'
                        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                    />
                    </Switch>
                    <Switch.Label className="ml-2 p-m-reg">{label}</Switch.Label>
                </div>
            </Switch.Group>
        )
}

export {Toggle};