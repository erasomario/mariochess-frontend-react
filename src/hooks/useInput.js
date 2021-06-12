import { useState, useRef } from 'react'

export const useInput = (initialValue = '') => {
    const ref = useRef(null)
    const [value, setValue] = useState(initialValue);
    return [
        { value, onChange: e => setValue(e.target.value), ref },
        (val = initialValue) => setValue(val),
        () => ref.current && ref.current.focus()
    ];
}