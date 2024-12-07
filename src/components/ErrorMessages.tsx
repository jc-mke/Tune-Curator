import React from "react";
import { useNavigate } from 'react-router-dom';

const ErrorMessages: React.FC<ErrorMessagesProps> = (props: ErrorMessagesProps): JSX.Element => {
    const navigate = useNavigate();
    return (
    <>
      <div className="bg-black flex flex-col items-center border-2 border-white p-5 rounded-none shadow-lg mb-5">
      {<p className='text-lg font-semibold text-red-600'>{props.message}</p>}
      {props.isTokenExpired ? <button onClick={() => navigate('/')} className='transition-all duration-300 hover:bg-slate-500 rounded-full p-3 text-lg font-semibold mt-6'> 
        Reauthenticate 
      </button> : null}
      </div>
    </>
    );
}

export default ErrorMessages;