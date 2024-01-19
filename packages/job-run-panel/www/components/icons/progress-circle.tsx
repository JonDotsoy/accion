import { type FC } from "react";

export const ProgressCircle: FC<{ className: string }> = ({ className }) => <svg width="24" height="24" className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.10571 18.8943C5.00575 18.7943 4.90808 18.6923 4.81275 18.5883L5.91848 17.5747C5.99915 17.6627 6.08179 17.7491 6.16637 17.8336C6.93245 18.5997 7.84193 19.2074 8.84286 19.622C9.8438 20.0366 10.9166 20.25 12 20.25C13.0834 20.25 14.1562 20.0366 15.1571 19.622C16.1581 19.2074 17.0675 18.5997 17.8336 17.8336C18.5997 17.0675 19.2074 16.1581 19.622 15.1571C20.0366 14.1562 20.25 13.0834 20.25 12H21.75C21.75 13.2804 21.4978 14.5482 21.0078 15.7312C20.5178 16.9141 19.7997 17.9889 18.8943 18.8943C17.9889 19.7997 16.9141 20.5178 15.7312 21.0078C14.5482 21.4978 13.2804 21.75 12 21.75C10.7196 21.75 9.45176 21.4978 8.26884 21.0078C7.08591 20.5178 6.01108 19.7997 5.10571 18.8943Z" fill="black" />
</svg>
