from django import forms
from .models import LoginBackground, ManagerBackground

class LoginBackgroundForm(forms.ModelForm):
    class Meta:
        model = LoginBackground
        fields = ['image']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].widget.attrs.update({
            'class': 'form-control',
            'accept': 'image/*'
        })
        
    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image:
            # Check file size (limit to 5MB)
            if image.size > 5 * 1024 * 1024:
                raise forms.ValidationError("Image file too large. Size should not exceed 5MB.")
            
            # Check file extension
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
            import os
            ext = os.path.splitext(image.name)[1].lower()
            if ext not in valid_extensions:
                raise forms.ValidationError("Unsupported file extension. Please use: .jpg, .jpeg, .png, or .gif")
                
        return image

class ManagerBackgroundForm(forms.ModelForm):
    opacity = forms.FloatField(
        min_value=0.0,
        max_value=1.0,
        initial=0.25,
        widget=forms.NumberInput(attrs={
            'type': 'range',
            'step': '0.05',
            'class': 'opacity-slider'
        })
    )
    
    class Meta:
        model = ManagerBackground
        fields = ['image', 'opacity']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].widget.attrs.update({
            'class': 'file-input',
            'accept': 'image/*'
        })
        
    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image:
            # Check file size (limit to 5MB)
            if image.size > 5 * 1024 * 1024:
                raise forms.ValidationError("Image file too large. Size should not exceed 5MB.")
            
            # Check file extension
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
            import os
            ext = os.path.splitext(image.name)[1].lower()
            if ext not in valid_extensions:
                raise forms.ValidationError("Unsupported file extension. Please use: .jpg, .jpeg, .png, or .gif")
                
        return image