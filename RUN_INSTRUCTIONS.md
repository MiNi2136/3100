# How to Run the Atendo Application

Due to PowerShell execution policy restrictions, you need to use Command Prompt to run the application.

## Starting the Frontend

1. Press `Win + R` keys
2. Type `cmd` and press Enter
3. In the Command Prompt window, navigate to the frontend folder:
   ```
   cd C:\Users\Pedp4WPBX4125BLF1024\Desktop\3100\frontend
   ```
4. Run the application:
   ```
   npm start
   ```

Alternatively, you can double-click the `start-frontend.bat` file in the frontend folder.

## Starting the Backend

1. Open another Command Prompt window (repeat steps 1-2 above)
2. Navigate to the backend folder:
   ```
   cd C:\Users\Pedp4WPBX4125BLF1024\Desktop\3100\backend
   ```
3. Run the backend server:
   ```
   npm run dev
   ```

Alternatively, you can double-click the `start-backend.bat` file in the backend folder.

## Permanently Fix PowerShell Restrictions (Optional)

If you want to use PowerShell in the future, you can change its execution policy:

1. Right-click on PowerShell and select "Run as Administrator"
2. Run the following command:
   ```
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` when prompted to confirm
