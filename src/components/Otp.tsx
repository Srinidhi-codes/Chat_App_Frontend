import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { VERIFY_OTP, RESEND_OTP } from "@/app/Views/auth/graphql/mutation";
import { useMutation } from "@apollo/client";
import { useAppStore } from "@/store";

interface OtpProps {
    userDetails: string
}


export default function Otp({ userDetails }: OtpProps) {
    const otpFields = [0, 1, 2, 3];
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [disable, setDisable] = useState(true);
    const [showTimer, setShowTimer] = useState(true);
    const [timer, setTimer] = useState(60);
    const [error, setError] = useState("");
    const [VerifyOtp] = useMutation(VERIFY_OTP);
    const [resendOtp] = useMutation(RESEND_OTP);
    const router = useRouter();
    const { setUserInfo } = useAppStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = +e.target.name;
        let value = e.target.value.replace(/\D/, "");

        if (value.length > 1) {
            value = value.slice(-1);
        }

        const tempOtp = [...otp];
        tempOtp[name] = value;
        setOtp(tempOtp);
        setError("");

        setDisable(tempOtp.some((val) => val === ""));
    };

    const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const name = +e.currentTarget.name;
        const value = e.currentTarget.value;

        let field: HTMLInputElement | null = null;

        if (["Delete", "Backspace"].includes(e.key)) {
            field = e.currentTarget.form?.elements[name - 1] as HTMLInputElement;
        } else if (value && e.key !== "Tab") {
            field = e.currentTarget.form?.elements[name + 1] as HTMLInputElement;
        }

        if (field) field.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !disable) {
            e.preventDefault();
            handleVerifyOtp();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = e.clipboardData.getData("text").replace(/\D/g, "");
        const arr = value.split("").slice(0, 4);
        setOtp(arr);
        setDisable(arr.length !== 4);
        const lastIndex = arr.length - 1;
        setTimeout(() => {
            const field = document.getElementById(`otpField-${lastIndex}`);
            if (field) (field as HTMLInputElement).focus();
        }, 0);
    };

    const handleVerifyOtp = async () => {
        const code = otp.join("");

        if (code.length !== 4) {
            setError("Invalid OTP");
            return;
        }

        try {
            const { data } = await VerifyOtp({
                variables: {
                    email: userDetails,
                    otp: code,
                },
            });

            const token = data?.verifyOtp?.token;
            if (token) {
                localStorage.setItem("token", token);
                setUserInfo(data?.verifyOtp)
                toast("OTP Verified");
                router.push("/chat");
            } else {
                setError("Invalid OTP");
            }
        } catch (err: any) {
            toast(`OTP Verification Error: ${err.message}`);
            setError("Invalid OTP");
        }
    };


    const handleResend = async () => {
        setTimer(60);
        setError("");
        setOtp(["", "", "", ""]);
        document.getElementById("otpField-0")?.focus();
        setShowTimer(true);

        try {
            const { data } = await resendOtp({
                variables: {
                    input: {
                        email: userDetails
                    },
                },
            });
            toast(data?.resendOtp?.message);
        } catch (err: any) {
            toast("Error in sending OTP, please try.");
        }
    };


    const otpClassName = (val: string) =>
        error && val ? "error-otpField" : val ? "filled-otpField" : "otpField";

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            setShowTimer(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer]);


    return (
        <div className="p-8 mx-8 bg-transparent rounded-md w-full max-w-[450px] flex flex-col items-center my-auto">
            {userDetails && (
                <p className="mb-4 text-sm font-medium text-center text-white">
                    We have sent the OTP to your email: {userDetails}
                </p>
            )}

            <form className="flex gap-3 pb-4">
                {otpFields.map((data, i) => (
                    <input
                        key={i}
                        id={`otpField-${i}`}
                        name={data.toString()}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        autoFocus={i === 0}
                        value={otp[data]}
                        onChange={handleChange}
                        onKeyUp={onKeyUp}
                        onKeyDown={(e) => i + 1 === otpFields.length && handleKeyDown(e)}
                        onPaste={handlePaste}
                        maxLength={1}
                        className={`${otpClassName(otp[data])} text-center font-medium text-xl w-12 h-12 rounded border border-gray-300 focus:outline-none`}
                    />
                ))}
            </form>

            {error && <p className="h-4 text-[14px] w-[14rem] text-red-600 text-start">
                {error ? "Invalid OTP" : ""}
            </p>}

            <div className="w-[14rem] h-3 my-2">
                {!showTimer ? (
                    <section className="flex text-black items-center justify-between w-full h-full">
                        <p className="w-full text-sm">Didn't receive OTP?</p>
                        <button
                            type="button"
                            className="text-black/70 text-sm bg-transparent outline-none w-fit cursor-pointer hover:text-black"
                            onClick={handleResend}
                        >
                            Resend
                        </button>
                    </section>
                ) : (
                    <p className="text-black text-sm font-medium ">
                        Resend OTP in {timer}s
                    </p>
                )}
            </div>

            <Button
                disabled={disable}
                className="mt-5 w-[14rem]"
                onClick={handleVerifyOtp}
            >
                Submit
            </Button>
        </div>
    );
}
