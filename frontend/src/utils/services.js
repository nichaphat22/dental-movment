// https://project-it-410215.uc.r.appspot.com/api
export const baseUrl = "http://localhost:8080/api";
// export const baseUrl = "https://backend-dot-project-it-410215.uc.r.appspot.com/api";

export const postRequest = async (url, body,token) => {
    const response = await fetch(url, {
        method: "POST",
        headers: { 
            "Access-Control-Allow-Headers" : "Content-Type",
             "Access-Control-Allow-Origin": "*",
           'Content-Type': 'application/json',
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH",
            "Authorization": `Bearer ${token}`,
       },
       
       body: JSON.stringify(body),
    });
    const data = await response.json();

        if (!response.ok){
            let message;

            if (data?.message) {
                message = data.message;
            }else {
                message = data;
            }

            return { error: true, message };
        }

    return data;
};

export const getRequest = async (url) => {
    const response = await fetch(url);
    
    const data = await response.json();

    if (!response.ok) {
        let message = "An error occured...";

        if (data?.message) {
            message = data.message;
        }

        return {error: true, message};
    }
    return data;
};

export const putRequest = async (url, body) => {
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            let message = "An error occurred";

            if (data?.message) {
                message = data.message;
            }

            return { error: true, message };
        }

        return data;
    } catch (error) {
        console.error("PUT request error:", error);
        return { error: true, message: error.message || "Unknown error" };
    }
};

export const patchRequest = async (url, body) => {
    try {
        const response = await fetch(url, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
           },
            body: JSON.stringify(body),
        });

        const responseData = await response.json();

        if (!response.ok) {
            let message = "An error occurred";

            if (responseData?.message) {
                message = responseData.message;
            }

            return { error: true, message };
        }

        return responseData;
    } catch (error) {
        console.error("Error in patchRequest:", error);
        return { error: true, message: error.message || "Unknown error" };
    }
};
