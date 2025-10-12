import { BsTruck } from 'react-icons/bs';

const TrukPercentage = ({
    percentage = 0,
    total_volume = 0,
    max_volume = 0,
    }) => {
        percentage = Math.ceil((total_volume / (max_volume)) * 100)
        return( 
            <>
                <p className='m-p-med'>Kapasitas Truk <span className="float-right">{Math.ceil(total_volume)}/{max_volume} (ml)</span></p>
                <div className="relative mt-4 p-8 bg-white rounded-lg border-[1px] border-neutral-30 w-[400px] min-h-[200px] overflow-hidden">
                    <div className={`absolute inset-y-0 left-0 bg-primary-border`} style={{ width: `${percentage}%` }}></div>
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="relative">
                            <BsTruck size={200} className="text-neutral-20"/>
                            <h3 className="absolute text-neutral-20 top-[45%] left-[40%] transform -translate-x-1/2 -translate-y-1/2">{percentage}%</h3>
                        </div>
                    </div>
                </div>
            </>
        )
}

export {TrukPercentage};

