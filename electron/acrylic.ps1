param([int]$hwnd)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class AcrylicFix {
    [DllImport("user32.dll")]
    public static extern int SetWindowCompositionAttribute(IntPtr hwnd, ref WindowCompositionAttributeData data);

    [DllImport("user32.dll")]
    public static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll")]
    public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("dwmapi.dll")]
    public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

    public const int GWL_STYLE = -16;
    public const int GWL_EXSTYLE = -20;

    public const int WS_THICKFRAME = 0x00040000;
    public const int WS_BORDER = 0x00800000;
    public const int WS_DLGFRAME = 0x00400000;
    public const int WS_CAPTION = 0x00C00000;

    public const int WS_EX_WINDOWEDGE = 0x00000100;
    public const int WS_EX_CLIENTEDGE = 0x00000200;
    public const int WS_EX_STATICEDGE = 0x00020000;
    public const int WS_EX_DLGMODALFRAME = 0x00000001;

    public const uint SWP_FRAMECHANGED = 0x0020;
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_NOZORDER = 0x0004;
    public const uint SWP_NOACTIVATE = 0x0010;

    public const int DWMWA_TRANSITIONS_FORCEDISABLED = 3;
    public const int DWMWA_BORDER_COLOR = 34;

    public const int DWMWCP_ROUND = 1;

    public static readonly IntPtr HWND_TOP = new IntPtr(0);

    public struct AccentPolicy {
        public uint AccentState;
        public uint AccentFlags;
        public uint GradientColor;
        public uint AnimationId;
    }

    public struct WindowCompositionAttributeData {
        public WindowCompositionAttribute Attribute;
        public IntPtr Data;
        public int SizeOfData;
    }

    public enum WindowCompositionAttribute : int {
        WCA_ACCENT_POLICY = 19
    }

    public static void Apply(IntPtr hwnd) {
        // 1. Disable DWM transitions
        int disable = 1;
        DwmSetWindowAttribute(hwnd, DWMWA_TRANSITIONS_FORCEDISABLED, ref disable, 4);

        // 2. Round corners
        int round = DWMWCP_ROUND;
        DwmSetWindowAttribute(hwnd, 33, ref round, 4);

        // 3. Transparent border color (removes default thick borders)
        int transparent = 0x00000000;
        DwmSetWindowAttribute(hwnd, DWMWA_BORDER_COLOR, ref transparent, 4);

        // 4. DWM Acrylic blur (AccentFlags=2 is the correct value for acrylic)
        var accent = new AccentPolicy {
            AccentState = 3,
            AccentFlags = 2,
            GradientColor = 0x00,
            AnimationId = 0
        };
        var data = new WindowCompositionAttributeData {
            Attribute = WindowCompositionAttribute.WCA_ACCENT_POLICY,
            Data = Marshal.AllocHGlobal(Marshal.SizeOf(accent)),
            SizeOfData = Marshal.SizeOf(accent)
        };
        Marshal.StructureToPtr(accent, data.Data, false);
        SetWindowCompositionAttribute(hwnd, ref data);
        Marshal.FreeHGlobal(data.Data);

        // 5. Remove window border styles
        int style = GetWindowLong(hwnd, GWL_STYLE);
        style = style & ~(WS_CAPTION | WS_THICKFRAME | WS_DLGFRAME | WS_BORDER);
        SetWindowLong(hwnd, GWL_STYLE, style);

        int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
        exStyle = exStyle & ~(WS_EX_WINDOWEDGE | WS_EX_CLIENTEDGE | WS_EX_STATICEDGE | WS_EX_DLGMODALFRAME);
        SetWindowLong(hwnd, GWL_EXSTYLE, exStyle);

        // 6. Force frame recalc to apply changes
        SetWindowPos(hwnd, IntPtr.Zero, 0, 0, 0, 0,
            SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE);
    }
}
"@

try { [AcrylicFix]::Apply([IntPtr]$hwnd) } catch {}
