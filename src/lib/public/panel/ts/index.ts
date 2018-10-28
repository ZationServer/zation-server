import {create} from 'zation-client';

(async () => {

    const client = create({
        hostname : 'localhost',
        port : 8080,
        postKey : 'zation', 
        debug : false
    });

    try {
        await client.connect();

        for(let i = 1; i < 6; i++) {
            $('body').append($('<p/>').text(`Ping ${i}: ${await client.ping()}ms`));
        }
    }
    catch (e) {
        $('body').append($('<p/>').text(e));
    }

})();

