param([int]$hwnd)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class Frost {
    [DllImport("user32.dll")]
    public static extern int SetWindowCompositionAttribute(IntPtr hwnd, ref WindowCompositionAttributeData data);

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

    public static void Enable(IntPtr hwnd) {
        var accent = new AccentPolicy {
            AccentState = 3,          // ACCENT_ENABLE_BLURBEHIND
            AccentFlags = 2,          // Acrylic (with gradient color)
            GradientColor = 0x00,     // Transparent gradient
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
    }
}
"@

try { [Frost]::Enable([IntPtr]$hwnd) } catch {}
