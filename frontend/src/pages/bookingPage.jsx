import React, { useState } from 'react';

function BookingPage() {
    const [count,setCount] =useState(0)
    return (
        <div>
            <button onClick={()=>setCount(count+1)}>Count : {count} </button>
        </div>
    );
    }

export default BookingPage;
