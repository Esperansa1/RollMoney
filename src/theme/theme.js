export const Theme = {
    colors: {
        primary: '#ff0000',
        secondary: '#ffffff',
        background: '#f8f9fa',
        surface: '#ffffff',
        surfaceVariant: '#f1f3f4',
        onPrimary: '#ffffff',
        onSecondary: '#000000',
        onBackground: '#1a1a1a',
        onSurface: '#1a1a1a',
        border: '#e0e0e0',
        shadow: 'rgba(0, 0, 0, 0.1)',
        hover: '#f5f5f5',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8'
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        round: '50%'
    },

    shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        md: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        lg: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        xl: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)'
    },

    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: {
            xs: '12px',
            sm: '14px',
            base: '16px',
            lg: '18px',
            xl: '20px',
            xxl: '24px'
        },
        fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700'
        },
        lineHeight: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75'
        }
    },

    animation: {
        duration: {
            fast: '150ms',
            normal: '250ms',
            slow: '400ms'
        },
        easing: {
            ease: 'ease',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out'
        }
    },

    zIndex: {
        dropdown: 1000,
        modal: 2000,
        overlay: 10000,
        tooltip: 20000
    }
};

export const getButtonStyles = (variant = 'primary', size = 'md') => {
    const baseStyles = {
        fontFamily: Theme.typography.fontFamily,
        fontSize: Theme.typography.fontSize.sm,
        fontWeight: Theme.typography.fontWeight.medium,
        lineHeight: Theme.typography.lineHeight.normal,
        borderRadius: Theme.borderRadius.md,
        border: 'none',
        cursor: 'pointer',
        transition: `all ${Theme.animation.duration.normal} ${Theme.animation.easing.easeInOut}`,
        outline: 'none',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        whiteSpace: 'nowrap'
    };

    const sizeStyles = {
        sm: {
            padding: `${Theme.spacing.xs} ${Theme.spacing.sm}`,
            fontSize: Theme.typography.fontSize.xs
        },
        md: {
            padding: `${Theme.spacing.sm} ${Theme.spacing.md}`,
            fontSize: Theme.typography.fontSize.sm
        },
        lg: {
            padding: `${Theme.spacing.md} ${Theme.spacing.lg}`,
            fontSize: Theme.typography.fontSize.base
        }
    };

    const variantStyles = {
        primary: {
            backgroundColor: Theme.colors.primary,
            color: Theme.colors.onPrimary,
            boxShadow: Theme.shadows.sm
        },
        secondary: {
            backgroundColor: Theme.colors.secondary,
            color: Theme.colors.onSecondary,
            border: `1px solid ${Theme.colors.border}`,
            boxShadow: Theme.shadows.sm
        },
        success: {
            backgroundColor: Theme.colors.success,
            color: Theme.colors.onPrimary
        },
        warning: {
            backgroundColor: Theme.colors.warning,
            color: Theme.colors.onSecondary
        },
        error: {
            backgroundColor: Theme.colors.error,
            color: Theme.colors.onPrimary
        }
    };

    return {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant]
    };
};

export const getInputStyles = () => ({
    fontFamily: Theme.typography.fontFamily,
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: Theme.typography.lineHeight.normal,
    padding: `${Theme.spacing.sm} ${Theme.spacing.md}`,
    border: `1px solid ${Theme.colors.border}`,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    color: Theme.colors.onSurface,
    outline: 'none',
    transition: `border-color ${Theme.animation.duration.normal} ${Theme.animation.easing.easeInOut}`,
    width: '100%',
    boxSizing: 'border-box'
});

export const getCardStyles = () => ({
    backgroundColor: Theme.colors.surface,
    border: `1px solid ${Theme.colors.border}`,
    borderRadius: Theme.borderRadius.lg,
    boxShadow: Theme.shadows.md,
    padding: Theme.spacing.lg,
    color: Theme.colors.onSurface
});

export const getOverlayStyles = () => ({
    position: 'fixed',
    backgroundColor: Theme.colors.surface,
    border: `2px solid ${Theme.colors.primary}`,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    zIndex: Theme.zIndex.overlay,
    boxShadow: Theme.shadows.xl,
    fontFamily: Theme.typography.fontFamily,
    color: Theme.colors.onSurface,
    minWidth: '350px',
    maxWidth: '500px'
});