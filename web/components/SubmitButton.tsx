import { Button } from "./ui/button"

type SubmitButtonProps = {
    formName: string,
};
function SubmitButton({formName}: SubmitButtonProps){

    return(
        <Button type="submit" variant="outline" form={formName}>Submit</Button>
    )
}

export default SubmitButton;