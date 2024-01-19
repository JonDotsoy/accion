import { FC, PropsWithChildren, createContext, useContext, useEffect, useRef } from "react"
import { jobMenuSizeStore } from "../stores/job-menu-size-store"


export const GridJobSizeColResize: FC<PropsWithChildren<{ className?: string }>> = ({ className, children }) => {

    const btnRef = useRef<HTMLButtonElement>(null)
    const dragEnterScreenX = useRef<number>(null)

    useEffect(() => {
        const btn = btnRef.current
        if (btn) {
            // btn.addEventListener('dragstart', (event) => {
            //     value.current = event.screenX
            //     Reflect.set(dragEnterScreenX, 'current', event.screenX)
            //     console.log('click')
            // })
            // btn.addEventListener('dragend', (event: DragEvent) => {
            //     if (dragEnterScreenX.current) {
            //         const diff = event.screenX - dragEnterScreenX.current
            //         jobMenuSizeStore.set(jobMenuSizeStore.get() + diff)
            //         console.log("🚀 ~ btn.addEventListener ~ diff:", diff)
            //     }
            // })
            // btn.addEventListener('dragover', (event: DragEvent) => {
            //     if (dragEnterScreenX.current) {
            //         const diff = event.screenX - dragEnterScreenX.current
            //         const end = jobMenuSizeStore.get() + diff
            //         console.log("🚀 ~ btn.addEventListener ~ end:", end)
            //         Reflect.set(dragEnterScreenX, 'current', end)
            //         jobMenuSizeStore.set(end)
            //     }
            // })
        }
    }, [btnRef.current])

    return <button ref={btnRef} draggable className={className}>{children}</button>
}