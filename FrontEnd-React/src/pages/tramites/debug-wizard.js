// Debug script para probar el wizard de trámites
// Este archivo se puede usar para hacer testing rápido

export const testWizardFlow = (tramite, formData, currentStep) => {
  console.log('=== TESTING WIZARD FLOW ===');
  console.log('Trámite:', tramite);
  console.log('Form Data:', formData);
  console.log('Current Step:', currentStep);
  
  // Test validación paso 1
  if (currentStep === 1) {
    console.log('--- TESTING STEP 1 ---');
    const step1Valid = !!(
      formData.nombre_completo?.trim() &&
      formData.documento?.trim() &&
      formData.telefono?.trim() &&
      formData.email?.trim() &&
      formData.direccion?.trim()
    );
    console.log('Step 1 valid:', step1Valid);
    console.log('Missing fields:', {
      nombre_completo: !formData.nombre_completo?.trim(),
      documento: !formData.documento?.trim(),
      telefono: !formData.telefono?.trim(),
      email: !formData.email?.trim(),
      direccion: !formData.direccion?.trim()
    });
    return step1Valid;
  }
  
  // Test validación paso 2
  if (currentStep === 2) {
    console.log('--- TESTING STEP 2 ---');
    console.log('Categoria:', tramite?.categoria);
    console.log('Datos adicionales:', formData.datos_adicionales);
    
    let step2Valid = true;
    
    if (tramite?.categoria === 'licencias') {
      step2Valid = !!(
        formData.datos_adicionales?.direccion_obra &&
        formData.datos_adicionales?.area_construccion > 0
      );
      console.log('Licencias validation:', {
        direccion_obra: !!formData.datos_adicionales?.direccion_obra,
        area_construccion: formData.datos_adicionales?.area_construccion > 0
      });
    }
    
    if (tramite?.categoria === 'certificados') {
      step2Valid = !!(formData.datos_adicionales?.cantidad > 0);
      console.log('Certificados validation:', {
        cantidad: formData.datos_adicionales?.cantidad > 0
      });
    }
    
    if (tramite?.categoria === 'permisos') {
      step2Valid = !!(formData.datos_adicionales?.duracion_meses > 0);
      console.log('Permisos validation:', {
        duracion_meses: formData.datos_adicionales?.duracion_meses > 0
      });
    }
    
    console.log('Step 2 valid:', step2Valid);
    return step2Valid;
  }
  
  // Step 3 y 4 son menos restrictivos por ahora
  return true;
};

export const debugFormData = (formData) => {
  console.log('=== FORM DATA DEBUG ===');
  console.log('Personal Info:', {
    nombre_completo: formData.nombre_completo,
    documento: formData.documento,
    telefono: formData.telefono,
    email: formData.email,
    direccion: formData.direccion
  });
  console.log('Additional Data:', formData.datos_adicionales);
  console.log('Observations:', formData.observaciones);
};
