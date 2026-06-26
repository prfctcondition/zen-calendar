param([int]$hwnd)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class FreeMove {
    [DllImport("user32.dll")]
    public static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll")]
    public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    public const int GWL_STYLE = -16;
    public const int GWL_EXSTYLE = -20;

    public const int WS_CAPTION = 0x00C00000;
    public const int WS_THICKFRAME = 0x00040000;
    public const int WS_DLGFRAME = 0x00400000;
    public const int WS_BORDER = 0x00800000;

    public const int WS_EX_WINDOWEDGE = 0x00000100;
    public const int WS_EX_CLIENTEDGE = 0x00000200;
    public const int WS_EX_STATICEDGE = 0x00020000;
    public const int WS_EX_DLGMODALFRAME = 0x00000001;
    public const int WS_EX_APPWINDOW = 0x00040000;
    public const int WS_EX_TOOLWINDOW = 0x00000080;

    public const uint SWP_FRAMECHANGED = 0x0020;
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_NOZORDER = 0x0004;
    public const uint SWP_NOACTIVATE = 0x0010;
    public const uint SWP_NOSENDCHANGING = 0x0400;

    public static void Apply(IntPtr hwnd) {
        // Strip all border/frame styles from regular style
        int style = GetWindowLong(hwnd, GWL_STYLE);
        style = style & ~(WS_CAPTION | WS_THICKFRAME | WS_DLGFRAME | WS_BORDER);
        SetWindowLong(hwnd, GWL_STYLE, style);

        // Strip all border styles from extended style
        int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
        exStyle = exStyle & ~(WS_EX_WINDOWEDGE | WS_EX_CLIENTEDGE | WS_EX_STATICEDGE | WS_EX_DLGMODALFRAME | WS_EX_APPWINDOW);
        SetWindowLong(hwnd, GWL_EXSTYLE, exStyle);

        // Force recalc with NOSENDCHANGING to prevent Windows from adjusting position
        SetWindowPos(hwnd, IntPtr.Zero, 0, 0, 0, 0,
            SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE | SWP_NOSENDCHANGING);
    }
}
"@

try { [FreeMove]::Apply([IntPtr]$hwnd) } catch {}
