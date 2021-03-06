import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { FaArrowLeft, FaDoorOpen, FaUser } from "react-icons/fa"
import { toast } from "react-toastify"
import { createTranslation } from "../../clients/translation-client"
import { useInput } from "../../hooks/useInput"
import Input from "../Input"

export default function CreateTranslation({ compact, onPageChanged }) {
    const { t } = useTranslation()
    const [keyProps, setKey,] = useInput("")
    const [engProps, setEng,] = useInput("")
    const [espProps, setEsp,] = useInput("")
    const [tagProps, setTag,] = useInput("")
    const tagRef = useRef()

    useEffect(() => {
        setKey(engProps.value.toLowerCase())
    }, [engProps.value, setKey])

    const addTrans = (e) => {
        e.preventDefault()
        createTranslation(keyProps.value, engProps.value, espProps.value)
            .then(() => {
                toast("ok");
                setTag(`t("${keyProps.value}")`)
                setKey("")
                setEng("")
                setEsp("")

                const tag = document.getElementById("tag");
                tag.focus();
                tag.select();
                document.execCommand("copy");

                const esp = document.getElementById("esp");
                esp.focus();

            })
            .catch(() => toast("error"))
    }

    return <>
        <div style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "600", fontSize: "1.3em",
            marginTop: (compact ? "0em" : "1.3em"),
            marginBottom: "0.5em",
        }}>
            <FaArrowLeft className="loginLink mr-2 mt-1" onClick={() => onPageChanged("login")} />
            <div>{t("create translation")}</div>
        </div>


        <Form onSubmit={addTrans}>
            <Input autoComplete="off" id="key" label="key" {...keyProps} type="text" ><FaUser /></Input>
            <Input autoComplete="off" id="esp" label="esp" {...espProps} type="text" ><FaUser /></Input>
            <Input autoComplete="off" id="eng" label="eng" {...engProps} type="text" ><FaUser /></Input>
            <Input autoComplete="off" id="tag" label="tag" {...tagProps} type="text" ref={tagRef} ><FaUser /></Input>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="primary" type="submit">
                    <span className='align-middle'>
                        {t("continue")}</span>
                    <FaDoorOpen className='ml-2' />
                </Button>
            </div>
        </Form>
    </>


}