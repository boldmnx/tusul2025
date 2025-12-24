from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from accounts.models import Account

class RegisterForm(ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Enter password'})
    )
    repeat_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Repeat password'})
    )

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password')

    def __init__(self, *args, **kwargs):
        super(RegisterForm, self).__init__(*args, **kwargs)
        self.fields['email'].widget.attrs['placeholder'] = "Enter Email"
        self.fields['first_name'].widget.attrs['placeholder'] = "Enter FirstName"
        self.fields['last_name'].widget.attrs['placeholder'] = "Enter LastName"
        for field in self.fields:
            self.fields[field].widget.attrs['class'] = 'form-control'

    # Validation
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Энэ имэйл аль хэдийн бүртгэлтэй байна.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        repeat_password = cleaned_data.get("repeat_password")

        if password and repeat_password and password != repeat_password:
            raise forms.ValidationError("Нууц үгнүүд таарахгүй байна.")

        return cleaned_data


class AccountsForm(ModelForm):
    phone_number = forms.CharField(
        widget=forms.NumberInput(attrs={
            'placeholder': 'Enter phone',
            'class': 'form-control',
        })
    )

    class Meta:
        model = Account
        fields = ('phone_number', 'pro_image')

    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        if Account.objects.filter(phone_number=phone_number).exists():
            raise forms.ValidationError("Энэ утасны дугаар бүртгэлтэй байна.")
        return phone_number