<!DOCTYPE html>
<html>
<head>
    <title>Your Account Details</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to DTS Logistics!</h2>
        
        <p style="color: #4b5563; line-height: 1.6;">Hello {{ $user->firstname ?? 'User' }},</p>
        
        <p style="color: #4b5563; line-height: 1.6;">An account has been created for you. Here are your login credentials:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Username:</strong> {{ $user->username }}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px;">{{ $plainPassword }}</span></p>
        </div>
        
        <p style="color: #ef4444; font-weight: bold; margin-top: 20px;">For your security, you will be required to change this password the first time you log in.</p>
        
        <p style="color: #4b5563; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Best regards,<br>
            DTS Logistics Administration
        </p>
    </div>
</body>
</html>
