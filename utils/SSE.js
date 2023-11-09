// sseUtil.js


const SSEclients = []
const notifications = []

function sendSSENotification(notif) {
    const notification = notif
    notifications.push(notification)


    SSEclients.forEach((client) => {
        client.res.write(`data: ${JSON.stringify(notification)}\n\n`)
    })
}

function sendSSENotification(notif, roles) {
    const notification = {
        ...notif,
        roles: roles || ["admin"], // An array of roles authorized to see this notification
    };

    notifications.push(notification);

    SSEclients.forEach((client) => {
        // Check if the client's role is authorized to see this notification
        if (client.role === 'admin' || notification.roles.includes(client.role)) {
            client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
        }
    });
}





// fake id

function generateFakeUniqueId() {
    const currentDate = new Date();
    const timestamp = currentDate.getTime(); // Get the current timestamp in milliseconds
    const randomPart = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
    const uniqueId = `${timestamp}-${randomPart}`;

    return uniqueId;
}

// Example usage:
const fakeUniqueId = generateFakeUniqueId();


module.exports = {
    SSEclients,
    notifications,
    fakeUniqueId,
    sendSSENotification
};
