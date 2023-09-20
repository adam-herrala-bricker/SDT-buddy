import { useSelector } from 'react-redux'


const Notifications = ({notificationText}) => {
    const notification = useSelector(i => i.notification)
    //console.log(notification)

    return(
        <div className = {`notification-${notification.type}`}>
            {notification.message}
        </div>
    )
}

export default Notifications