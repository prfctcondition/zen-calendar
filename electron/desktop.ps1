param([int]$hwnd)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class DesktopAPI {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("user32.dll")]
    public static extern int SetWindowCompositionAttribute(IntPtr hwnd, ref WindowCompositionAttributeData data);

    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_NOZORDER = 0x0004;
    public const uint SWP_NOACTIVATE = 0x0010;
    public const uint SWP_SHOWWINDOW = 0x0040;
    public static readonly IntPtr HWND_BOTTOM = new IntPtr(1);

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

    public static void Apply(IntPtr widgetHwnd) {
        // 1. Find Progman
        IntPtr progman = FindWindow("ProgMan", null);
        if (progman == IntPtr.Zero) return;

        // 2. Send message to create WorkerW
        SendMessage(progman, 0x052C, IntPtr.Zero, IntPtr.Zero);

        // 3. Find WorkerW that has SHELLDLL_DefView as child
        IntPtr workerw = IntPtr.Zero;
        while (true) {
            workerw = FindWindowEx(IntPtr.Zero, workerw, "WorkerW", null);
            if (workerw == IntPtr.Zero) break;

            IntPtr child = FindWindowEx(workerw, IntPtr.Zero, "SHELLDLL_DefView", null);
            if (child != IntPtr.Zero) {
                // Found the WorkerW that contains the desktop icons
                break;
            }
        }

        if (workerw == IntPtr.Zero) return;

        // 4. Set widget as child of WorkerW (behind desktop icons)
        SetParent(widgetHwnd, workerw);

        // 5. Position it at bottom layer
        SetWindowPos(widgetHwnd, HWND_BOTTOM, 0, 0, 0, 0,
            SWP_NOSIZE | SWP_NOMOVE | SWP_NOZORDER | SWP_NOACTIVATE);

        // 6. Apply DWM acrylic blur
        var accent = new AccentPolicy { AccentState = 3, AccentFlags = 2, GradientColor = 0x00, AnimationId = 0 };
        var data = new WindowCompositionAttributeData {
            Attribute = WindowCompositionAttribute.WCA_ACCENT_POLICY,
            Data = Marshal.AllocHGlobal(Marshal.SizeOf(accent)),
            SizeOfData = Marshal.SizeOf(accent)
        };
        Marshal.StructureToPtr(accent, data.Data, false);
        SetWindowCompositionAttribute(widgetHwnd, ref data);
        Marshal.FreeHGlobal(data.Data);

        // 7. Restore window
        SetWindowPos(widgetHwnd, HWND_BOTTOM, 0, 0, 0, 0,
            SWP_NOSIZE | SWP_NOMOVE | SWP_NOZORDER | SWP_SHOWWINDOW);
    }
}
"@

try { [DesktopAPI]::Apply([IntPtr]$hwnd) } catch {}
