import React from 'react';
import { IonInput, IonSelect, IonSelectOption, IonTextarea } from '@ionic/react';
import { Material } from '../../types';
import { MaterialMappings } from '../../config/materialMappings';
import labels from '../../labels';

interface MaterialFormFieldProps {
    material: Material;
    fieldName: keyof Material;
    changeMaterial: (key: string, value: string | number | null | undefined) => void;
    isNew: boolean;
    isVisible?: boolean;
    required?: boolean;
    type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
    options?: Array<{ id: string; label: string }>;
    unit?: string;
}

const MaterialFormField: React.FC<MaterialFormFieldProps> = ({
    material,
    fieldName,
    changeMaterial,
    isNew,
    isVisible = true,
    required = false,
    type = 'text',
    options = [],
    unit
}) => {
    if (!isVisible) return null;

    const fieldValue = material[fieldName] as string;
    const label = labels[fieldName as keyof typeof labels] || fieldName;
    const fieldId = `input-${fieldName}`;

    const renderField = () => {
        switch (type) {
            case 'select':
                return isNew ? (
                    <IonSelect
                        interfaceOptions={{ cssClass: `cy-material-${fieldName}-alert` }}
                        required={required}
                        label={label}
                        value={fieldValue}
                        className={required && !fieldValue ? 'ion-invalid' : ''}
                        onIonChange={(ev) => changeMaterial(fieldName, ev.target.value)}
                        data-cy={`material-${fieldName}-select`}
                    >
                        {options.map((option) => (
                            <IonSelectOption
                                key={option.id}
                                value={option.id}
                                data-cy={`material-${fieldName}-option-${option.id}`}
                            >
                                {option.label}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                ) : (
                    <div className="py-2 px-3 bg-gray-50 rounded border border-gray-200">
                        <b>{label}:</b> {options.find(opt => opt.id === fieldValue)?.label || fieldValue}
                    </div>
                );

            case 'textarea':
                return isNew ? (
                    <IonTextarea
                        data-cy={fieldId}
                        onIonInput={(ev) => changeMaterial(fieldName, ev.target.value)}
                        label={label}
                        value={fieldValue}
                        labelPlacement="floating"
                        className="w-full"
                    />
                ) : (
                    <div className="py-2 px-3 bg-gray-50 rounded border border-gray-200">
                        <b>{label}:</b> {fieldValue}
                    </div>
                );

            default:
                return isNew ? (
                    <div className="flex items-center">
                        <IonInput
                            data-cy={fieldId}
                            onIonInput={(ev) => changeMaterial(fieldName, ev.target.value)}
                            label={label}
                            value={fieldValue}
                            type={type}
                            labelPlacement="floating"
                            className="w-full"
                        />
                        {unit && <span className="ml-1">{unit}</span>}
                    </div>
                ) : (
                    <div className="py-2 px-3 bg-gray-50 rounded border border-gray-200">
                        <b>{label}:</b> {fieldValue}
                        {unit && <span className="ml-1">{unit}</span>}
                    </div>
                );
        }
    };

    return (
        <div>
            <label className="block font-semibold mb-1 text-gray-700">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            {renderField()}
        </div>
    );
};

// Helper component for material type field
export const MaterialTypeField: React.FC<{
    material: Material;
    changeMaterial: (key: string, value: string | number | null | undefined) => void;
    isNew: boolean;
}> = ({ material, changeMaterial, isNew }) => (
    <MaterialFormField
        material={material}
        fieldName="type"
        changeMaterial={changeMaterial}
        isNew={isNew}
        required
        type="select"
        options={[...MaterialMappings.getMaterialTypeOptions()]}
    />
);

// Helper component for wood species field
export const WoodSpeciesField: React.FC<{
    material: Material;
    changeMaterial: (key: string, value: string | number | null | undefined) => void;
    isNew: boolean;
}> = ({ material, changeMaterial, isNew }) => (
    <MaterialFormField
        material={material}
        fieldName="specie"
        changeMaterial={changeMaterial}
        isNew={isNew}
        required
        type="select"
        options={[...MaterialMappings.getWoodSpeciesOptions()]}
    />
);

export default MaterialFormField;
