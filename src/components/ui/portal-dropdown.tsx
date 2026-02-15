import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Placement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

interface PortalDropdownProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
    /** Placement of the dropdown relative to the trigger, default: 'bottom-end' */
    placement?: Placement;
    /** Gap between trigger and dropdown in px, default: 8 */
    offset?: number;
    /** Extra className for the dropdown panel */
    className?: string;
    /** Whether the trigger is disabled */
    disabled?: boolean;
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({
    open,
    onOpenChange,
    trigger,
    children,
    placement = 'bottom-end',
    offset = 8,
    className = '',
    disabled = false,
}) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);

    // Calculate dropdown position based on trigger rect and placement
    const updatePosition = useCallback(() => {
        if (!triggerRef.current || !dropdownRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        // const viewportHeight = window.innerHeight; // Unused for now

        const [vertical, horizontal] = placement.split('-') as [string, string];
        let top = 0;
        let left = 0;

        // Vertical positioning
        if (vertical === 'bottom') {
            top = triggerRect.bottom + offset + window.scrollY;
        } else {
            top = triggerRect.top - offset - dropdownRect.height + window.scrollY;
        }

        // Horizontal positioning
        if (horizontal === 'end') {
            left = triggerRect.right - dropdownRect.width + window.scrollX;
        } else {
            left = triggerRect.left + window.scrollX;
        }

        // Horizontal Boundary Check (Keep inside viewport)
        const PADDING = 10;
        // Convert back to viewport coordinates for check
        const viewportLeft = left - window.scrollX;

        if (viewportLeft < PADDING) {
            left = PADDING + window.scrollX;
        } else if (viewportLeft + dropdownRect.width > viewportWidth - PADDING) {
            left = viewportWidth - dropdownRect.width - PADDING + window.scrollX;
        }

        setPosition({ top, left });
        setIsVisible(true);
    }, [placement, offset]);

    // Use layout effect to calculate position before paint
    React.useLayoutEffect(() => {
        if (!open) {
            setIsVisible(false);
            return;
        }
        updatePosition();

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open, updatePosition]);

    // Close on click outside
    useEffect(() => {
        if (!open) return;

        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                dropdownRef.current && !dropdownRef.current.contains(target) &&
                triggerRef.current && !triggerRef.current.contains(target)
            ) {
                onOpenChange(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onOpenChange]);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onOpenChange(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onOpenChange]);

    return (
        <>
            <div
                ref={triggerRef}
                onClick={() => { if (!disabled) onOpenChange(!open); }}
                className={`inline-flex ${!disabled ? 'cursor-pointer' : ''}`}
            >
                {trigger}
            </div>

            {open && createPortal(
                <div
                    ref={dropdownRef}
                    className={`fixed bg-card shadow-lg border border-border z-[9999] ${className}`}
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        opacity: isVisible ? 1 : 0,
                        pointerEvents: isVisible ? 'auto' : 'none',
                        // Remove transform based positioning
                    }}
                >
                    {children}
                </div>,
                document.body,
            )}
        </>
    );
};

export default PortalDropdown;
