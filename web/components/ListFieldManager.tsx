import {Card, CardContent,CardDescription, CardFooter, CardHeader,CardTitle} from '@/components/ui/card'
import { Field,FieldGroup,FieldLabel,FieldError, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useReducer, useState } from 'react';
import { X } from 'lucide-react';

interface ListFieldManagerProps {
    label: string,
    description: string,
    placeholder: string,
    items: string[],
    onAdd: (item: string) => void,
    onRemove: (index: number) => void,
    maxItems: number,
    minLength?:number,
    maxLength?: number,
    validate?: (item: string) => boolean,
    validationMessage?: string,
    hiddenInputName: string,
    errors?: string[]
}


export function ListFieldManager({label, description,placeholder,items,onAdd,onRemove,maxItems,minLength,maxLength,validate, validationMessage,hiddenInputName,errors}: ListFieldManagerProps){

    const [inputValue,setInputValue] = useState("")
    const [inputError, setInputError] = useState<string | null>(null);

    const handleAdd = () => {
        const trimmedInput = inputValue.trim();

        if(!minLength ||  trimmedInput.length < minLength ){
            setInputError(`Must be at least ${minLength} characters`)
            return
        }
        if(maxLength && trimmedInput.length > maxLength){
            setInputError(`Must be less than ${maxLength} characters`)
            return
        }
        if(items.includes(trimmedInput)){
            setInputError("This item already exists.");
            return
        }
        if(items.length >= maxItems){
            setInputError(`Can only add a maximum of ${maxItems}`)
        }

        setInputError(null);
        onAdd(trimmedInput);
    }

    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAdd()
        }
    }
     const isAddDisabled = !inputValue.trim() || items.length >= maxItems;

     return(
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setInputError(null)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={items.length >= maxItems}
                />
                <Button
                    type="button"
                    onClick={handleAdd}
                    disabled={isAddDisabled}
                >
                    Add
                </Button>
            </div>
            <FieldDescription>{description}</FieldDescription>
            
            {/* Validation error for input */}
            {inputError && (
                <p className="text-sm text-destructive mt-1">{inputError}</p>
            )}
            
            {/* Render items as tags */}
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {items.map((item, index) => (
                        <span
                            key={index}
                            className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                        >
                            <span className="max-w-[200px] truncate">{item}</span>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="hover:text-destructive"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            
            {/* Hidden inputs for form submission */}
            {items.map((item, index) => (
                <input key={index} type="hidden" name={hiddenInputName} value={item} />
            ))}
            
            {/* Server-side errors */}
            {errors && errors.length > 0 && (
                <p className="text-sm text-destructive mt-1">{errors[0]}</p>
            )}
        </Field>
    )

}
     

