import clsx from "clsx";

interface ResponseProps {
    gemini: boolean;
    content: string;
}

export default function Response({ gemini, content }: ResponseProps) {
    const backgroundColor = gemini ? "#CC5500" : "#90D5FF";
    return (
        <div 
            className="max-w-400 w-full p-2 rounded-md mb-2"
            style={{ backgroundColor }}
        >
            <p className="text-black font-semibold">{content}</p>
        </div>
    )
}