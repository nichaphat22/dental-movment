// https://project-it-410215.uc.r.appspot.com/api
// export const baseUrl = "http://localhost:8080/api";
export const baseUrl = "https://project-it-410215.uc.r.appspot.com/api";

export const postRequest = async (url, body) => {
    const response = await fetch(url, {
        method: "POST",
        headers: { 
            "Access-Control-Allow-Headers" : "Content-Type",
             "Access-Control-Allow-Origin": "*",
           'Content-Type': 'application/json',
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH"
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

