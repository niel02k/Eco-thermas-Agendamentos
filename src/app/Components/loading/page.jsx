import styles from "./loanding.module.css"

export default function Loading({
    icon: Icon,
    text,
}) {
    return(
        <div className={styles.container}>
            <div className={styles.iconContainer}>
                <Icon className={styles.icon} size={30}/>
            </div>
            <h2 className={styles.text}>{text}</h2>
        </div>
    )
}