import { useState } from "react"

export default () => {
    const [num, sum] = useState(0)
    return <>
        <button className="border border-red-500 text-bold p-4" onClick={() => sum(e => e + 1)}>{num}</button>
    </>
}