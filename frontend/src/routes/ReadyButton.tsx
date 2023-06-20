
export default function ReadyButton() {
    const handleSubmit = () => {

    }
    return (
        <div className="p-5">
            <div className="Auth-form-container">
                <form className="Auth-form" onSubmit={handleSubmit}>
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">Ready?</h3>

                    </div>
                </form>
            </div>
        </div>
    )
}