'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Upload, Calendar, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types for Custom Order Form
export interface CustomOrderFormState {
    // Step 1: Project Vision
    projectType: string;
    stylePreference: string;
    budgetRange: string;
    inspiration: string;

    // Step 2: Design Details
    metalType: string;
    stonePreferences: string[];
    sizeRequirements: string;
    specialRequests: string;

    // Step 3: Images & References
    uploadedImages: CustomOrderImage[];
    imageCategories: Record<string, string[]>;

    // Step 4: Contact & Timeline
    contactInfo: CustomerInfo;
    timelinePreference: string;
    consultationType: string;
    preferredContactMethod: string;
}

export interface CustomOrderImage {
    id: string;
    url: string;
    fileName: string;
    type: 'inspiration' | 'sketch' | 'reference';
    uploadedAt: string;
}

export interface CustomerInfo {
    name: string;
    email: string;
    phone?: string;
}

// Step configuration
const CUSTOM_ORDER_STEPS = [
    {
        id: 'vision',
        title: 'Project Vision',
        description: 'Define your project goals',
        icon: '🎯'
    },
    {
        id: 'details',
        title: 'Design Details',
        description: 'Materials and specifications',
        icon: '💎'
    },
    {
        id: 'images',
        title: 'Images & References',
        description: 'Upload inspiration and sketches',
        icon: '📸'
    },
    {
        id: 'contact',
        title: 'Contact & Timeline',
        description: 'Schedule your consultation',
        icon: '📅'
    }
] as const;

type StepId = typeof CUSTOM_ORDER_STEPS[number]['id'];

// Project type options
const PROJECT_TYPES = [
    { id: 'engagement_ring', label: 'Engagement Ring', description: 'A symbol of commitment' },
    { id: 'wedding_band', label: 'Wedding Band', description: 'Complete the set' },
    { id: 'necklace', label: 'Necklace', description: 'Statement or subtle' },
    { id: 'earrings', label: 'Earrings', description: 'Elegant accents' },
    { id: 'bracelet', label: 'Bracelet', description: 'Wrist elegance' },
    { id: 'watch', label: 'Custom Watch', description: 'Timepiece perfection' },
    { id: 'other', label: 'Other', description: 'Something unique' }
];

const STYLE_PREFERENCES = [
    { id: 'modern', label: 'Modern', description: 'Clean, contemporary lines' },
    { id: 'classic', label: 'Classic', description: 'Timeless elegance' },
    { id: 'vintage', label: 'Vintage', description: 'Nostalgic charm' },
    { id: 'avant_garde', label: 'Avant-Garde', description: 'Bold and unique' }
];

const BUDGET_RANGES = [
    { id: '1k-3k', label: '$1,000 - $3,000', description: 'Premium starting point' },
    { id: '3k-5k', label: '$3,000 - $5,000', description: 'Most popular range' },
    { id: '5k-10k', label: '$5,000 - $10,000', description: 'Luxury selection' },
    { id: '10k-20k', label: '$10,000 - $20,000', description: 'High-end custom' },
    { id: '20k+', label: '$20,000+', description: 'Ultimate luxury' }
];

const METAL_TYPES = [
    { id: 'gold_14k', label: '14K Gold', description: 'Durable everyday luxury' },
    { id: 'gold_18k', label: '18K Gold', description: 'Premium gold content' },
    { id: 'platinum', label: 'Platinum', description: 'The ultimate precious metal' },
    { id: 'white_gold', label: 'White Gold', description: 'Modern elegance' },
    { id: 'rose_gold', label: 'Rose Gold', description: 'Distinctive warmth' }
];

const TIMELINE_PREFERENCES = [
    { id: 'standard', label: 'Standard (8-12 weeks)', description: 'Our recommended timeline' },
    { id: 'expedited', label: 'Expedited (4-6 weeks)', description: 'Faster completion (+20%)' },
    { id: 'rush', label: 'Rush (2-4 weeks)', description: 'Priority handling (+40%)' },
    { id: 'flexible', label: 'Flexible', description: 'No specific deadline' }
];

interface CustomOrderFlowProps {
    initialData?: Partial<CustomOrderFormState>;
    onSubmit: (data: CustomOrderFormState) => Promise<void>;
    onSaveDraft?: (data: Partial<CustomOrderFormState>) => void;
}

export function CustomOrderFlow({ initialData, onSubmit, onSaveDraft }: CustomOrderFlowProps) {
    const [currentStep, setCurrentStep] = useState<StepId>('vision');
    const [formData, setFormData] = useState<Partial<CustomOrderFormState>>(initialData || {});
    const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-save draft every 30 seconds
    useEffect(() => {
        if (!onSaveDraft) return;

        const interval = setInterval(() => {
            if (Object.keys(formData).length > 0) {
                onSaveDraft(formData);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [formData, onSaveDraft]);

    // Get current step index
    const currentStepIndex = CUSTOM_ORDER_STEPS.findIndex(step => step.id === currentStep);
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === CUSTOM_ORDER_STEPS.length - 1;

    // Update form data
    const updateFormData = (updates: Partial<CustomOrderFormState>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setErrors({});
    };

    // Validate email
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Validate current step
    const validateCurrentStep = (): boolean => {
        const stepErrors: Record<string, string> = {};

        switch (currentStep) {
            case 'vision':
                if (!formData.projectType) stepErrors.projectType = 'Please select a project type';
                if (!formData.budgetRange) stepErrors.budgetRange = 'Budget range helps us provide accurate estimates';
                break;
            case 'details':
                if (!formData.metalType) stepErrors.metalType = 'Please specify your metal preference';
                break;
            case 'contact':
                if (!formData.contactInfo?.name) stepErrors.name = 'Name is required';
                if (!formData.contactInfo?.email) stepErrors.email = 'Email is required';
                if (formData.contactInfo?.email && !isValidEmail(formData.contactInfo.email)) {
                    stepErrors.email = 'Please enter a valid email address';
                }
                if (!formData.timelinePreference) stepErrors.timelinePreference = 'Please select your timeline preference';
                break;
        }

        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    // Navigation functions
    const goToNextStep = () => {
        if (validateCurrentStep()) {
            setCompletedSteps(prev => new Set([...prev, currentStep]));

            if (!isLastStep) {
                const nextStep = CUSTOM_ORDER_STEPS[currentStepIndex + 1];
                setCurrentStep(nextStep.id);
            }
        }
    };

    const goToPreviousStep = () => {
        if (!isFirstStep) {
            const prevStep = CUSTOM_ORDER_STEPS[currentStepIndex - 1];
            setCurrentStep(prevStep.id);
        }
    };

    const goToStep = (stepId: StepId) => {
        const targetStepIndex = CUSTOM_ORDER_STEPS.findIndex(step => step.id === stepId);
        if (targetStepIndex <= currentStepIndex || completedSteps.has(currentStep)) {
            setCurrentStep(stepId);
        }
    };

    const transformFormDataForAPI = (formData: Partial<CustomOrderFormState>) => {
        const contactInfo: CustomerInfo = formData.contactInfo || { name: '', email: '', phone: '' };

        return {
            step1: {
                project_type: formData.projectType || '',
                style_preference: formData.stylePreference || '',
                room_type: 'not_specified', // Add this field or map appropriately
                project_description: formData.inspiration || '',
                inspiration_notes: formData.inspiration || ''
            },
            step2: {
                dimensions: {
                    length: 0,
                    width: 0,
                    height: 0,
                    unit: 'cm'
                }, // You'll need to add dimension fields to your form
                materials: formData.metalType ? [formData.metalType] : [],
                color_preferences: [],
                special_requirements: formData.specialRequests || '',
                functionality_needs: formData.stonePreferences || []
            },
            step3: {
                budget_range: formData.budgetRange || '',
                estimated_price: null,
                payment_preference: 'not_specified'
            },
            step4: {
                name: contactInfo.name || '',
                email: contactInfo.email || '',
                phone: contactInfo.phone || '',
                timeline_preference: formData.timelinePreference || 'standard',
                target_completion: null,
                delivery_address: '',
                consultation_preference: formData.consultationType || 'video',
                preferred_contact_time: formData.preferredContactMethod || 'email',
                marketing_consent: true,
                communication_preferences: [formData.preferredContactMethod || 'email']
            },
            images: [] // Handle image URLs here if you have them
        };
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateCurrentStep()) return;

        setIsSubmitting(true);
        try {
            // Transform the data to match API expectations
            const apiData = transformFormDataForAPI(formData);

            await onSubmit(apiData as any); // Pass transformed data
            toast.success('Custom order submitted successfully!');
        } catch (error) {
            console.error('Custom order submission failed:', error);
            toast.error('Failed to submit your custom order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
            <div className="flex min-h-screen">
                {/* Vertical Progress Sidebar - Desktop */}
                <div className="hidden md:flex flex-col w-80">
                    <div className="p-8">
                        <h3 className="text-xl font-bold mb-8">Custom Order Process</h3>

                        <div className="space-y-6">
                            {CUSTOM_ORDER_STEPS.map((step, index) => {
                                const isActive = step.id === currentStep;
                                const isCompleted = completedSteps.has(step.id);
                                const isAccessible = index <= currentStepIndex || isCompleted;

                                return (
                                    <motion.button
                                        key={step.id}
                                        onClick={() => isAccessible && goToStep(step.id)}
                                        className={`w-full text-left transition-all duration-300 ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                                            }`}
                                        whileHover={isAccessible ? { x: 4 } : {}}
                                        disabled={!isAccessible}
                                    >
                                        <div className="flex items-center space-x-4">
                                            {/* Step Circle with Connection Line */}
                                            <div className="relative flex flex-col items-center">
                                                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isActive
                                                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                                                    : isCompleted
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                                                    }`}>
                                                    {isCompleted ? (
                                                        <Check className="w-5 h-5" />
                                                    ) : (
                                                        <span className="text-lg">{step.icon}</span>
                                                    )}
                                                </div>

                                                {/* Connection Line */}
                                                {index < CUSTOM_ORDER_STEPS.length - 1 && (
                                                    <div className={`w-0.5 h-12 mt-2 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                                        }`} />
                                                )}
                                            </div>

                                            {/* Step Content */}
                                            <div className="flex-1">
                                                <div className={`font-semibold ${isActive ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {step.title}
                                                </div>
                                                <div className={`text-sm ${isActive ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'
                                                    }`}>
                                                    {step.description}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile Progress Header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                    <div className="px-6 py-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold">Step {currentStepIndex + 1} of {CUSTOM_ORDER_STEPS.length}</h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {Math.round(((currentStepIndex + 1) / CUSTOM_ORDER_STEPS.length) * 100)}%
                            </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-black dark:bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStepIndex + 1) / CUSTOM_ORDER_STEPS.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 lg:pl-0 pt-24 lg:pt-0">
                    <div className="max-w-4xl mx-auto px-6 py-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-8"
                            >
                                {/* Step Content */}
                                {currentStep === 'vision' && (
                                    <ProjectVisionStep
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        errors={errors}
                                    />
                                )}

                                {currentStep === 'details' && (
                                    <DesignDetailsStep
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        errors={errors}
                                    />
                                )}

                                {currentStep === 'images' && (
                                    <ImagesReferencesStep
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        errors={errors}
                                    />
                                )}

                                {currentStep === 'contact' && (
                                    <ContactTimelineStep
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        errors={errors}
                                    />
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        onClick={goToPreviousStep}
                                        disabled={isFirstStep}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${isFirstStep
                                            ? 'opacity-0 cursor-not-allowed'
                                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900'
                                            }`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>

                                    {isLastStep ? (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Custom Order'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={goToNextStep}
                                            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step Components
function ProjectVisionStep({ formData, updateFormData, errors }: {
    formData: any;
    updateFormData: (updates: any) => void;
    errors: Record<string, string>;
}) {
    return (
        <>
            <div>
                <h2 className="text-4xl font-bold mb-4">Define Your Vision</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    What are you looking to create? Every masterpiece starts with a clear objective.
                </p>
            </div>

            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-semibold mb-4">Project Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PROJECT_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => updateFormData({ projectType: type.id })}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${formData.projectType === type.id
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <div className="font-semibold">{type.label}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{type.description}</div>
                            </button>
                        ))}
                    </div>
                    {errors.projectType && <p className="text-red-500 text-sm mt-2">{errors.projectType}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-4">Style Preference</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {STYLE_PREFERENCES.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => updateFormData({ stylePreference: style.id })}
                                className={`p-4 rounded-lg border-2 text-center transition-all duration-300 ${formData.stylePreference === style.id
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <div className="font-semibold">{style.label}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{style.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-4">Investment Range</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {BUDGET_RANGES.map((budget) => (
                            <button
                                key={budget.id}
                                onClick={() => updateFormData({ budgetRange: budget.id })}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${formData.budgetRange === budget.id
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <div className="font-semibold">{budget.label}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{budget.description}</div>
                            </button>
                        ))}
                    </div>
                    {errors.budgetRange && <p className="text-red-500 text-sm mt-2">{errors.budgetRange}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-4">Project Vision & Requirements</label>
                    <textarea
                        value={formData.inspiration || ''}
                        onChange={(e) => updateFormData({ inspiration: e.target.value })}
                        placeholder="Describe your vision, specific requirements, or any details that will help us understand your project..."
                        rows={4}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                </div>
            </div>
        </>
    );
}

function DesignDetailsStep({ formData, updateFormData, errors }: {
    formData: any;
    updateFormData: (updates: any) => void;
    errors: Record<string, string>;
}) {
    return (
        <>
            <div>
                <h2 className="text-4xl font-bold mb-4">Specifications & Materials</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Let's define the technical requirements and materials for your project.
                </p>
            </div>

            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-semibold mb-4">Metal Preference</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {METAL_TYPES.map((metal) => (
                            <button
                                key={metal.id}
                                onClick={() => updateFormData({ metalType: metal.id })}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${formData.metalType === metal.id
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <div className="font-semibold">{metal.label}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{metal.description}</div>
                            </button>
                        ))}
                    </div>
                    {errors.metalType && <p className="text-red-500 text-sm mt-2">{errors.metalType}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-4">Stone & Gem Preferences</label>
                    <textarea
                        value={formData.stonePreferences?.join(', ') || ''}
                        onChange={(e) => updateFormData({ stonePreferences: e.target.value.split(', ').filter(s => s.trim()) })}
                        placeholder="Diamond, sapphire, emerald, ruby, or other stone preferences..."
                        rows={3}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-4">Size & Dimension Requirements</label>
                    <textarea
                        value={formData.sizeRequirements || ''}
                        onChange={(e) => updateFormData({ sizeRequirements: e.target.value })}
                        placeholder="Ring size, chain length, dimensions, or any size specifications..."
                        rows={3}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-4">Additional Specifications</label>
                    <textarea
                        value={formData.specialRequests || ''}
                        onChange={(e) => updateFormData({ specialRequests: e.target.value })}
                        placeholder="Engravings, special finishes, matching sets, or any other custom specifications..."
                        rows={4}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                </div>
            </div>
        </>
    );
}

function ImagesReferencesStep({ formData, updateFormData, errors }: {
    formData: any;
    updateFormData: (updates: any) => void;
    errors: Record<string, string>;
}) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Handle file upload logic here
            console.log("Files dropped:", e.dataTransfer.files);
        }
    };

    return (
        <>
            <div>
                <h2 className="text-4xl font-bold mb-4">Visual References</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Upload reference images, sketches, or inspiration photos to help us understand your vision.
                </p>
            </div>

            <div className="grid gap-6">
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${dragActive
                        ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Upload Reference Images</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Drag and drop images here, or click to browse
                    </p>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={(e) => {
                            if (e.target.files) {
                                console.log("Files selected:", e.target.files);
                            }
                        }}
                    />
                    <label
                        htmlFor="image-upload"
                        className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Choose Files
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Supports JPG, PNG, HEIC • Max 8 images • 10MB each
                    </p>
                </div>

                {/* Image Preview Area */}
                {formData.uploadedImages && formData.uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.uploadedImages.map((image: CustomOrderImage) => (
                            <div key={image.id} className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <img
                                    src={image.url}
                                    alt={image.fileName}
                                    className="w-full h-full object-cover"
                                />
                                <button className="absolute top-2 right-2 bg-black dark:bg-white text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h4 className="font-semibold mb-3">💡 Tips for Effective Reference Images</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Multiple angles help us understand the design better</li>
                        <li>• Close-up detail shots of textures and finishes</li>
                        <li>• Sketches or drawings of your ideas (even rough ones!)</li>
                        <li>• Photos of pieces you love for style inspiration</li>
                        <li>• Images showing scale or size references</li>
                    </ul>
                </div>
            </div>
        </>
    );
}

function ContactTimelineStep({ formData, updateFormData, errors }: {
    formData: any;
    updateFormData: (updates: any) => void;
    errors: Record<string, string>;
}) {
    const contactInfo = formData.contactInfo || {};

    const updateContactInfo = (updates: Partial<CustomerInfo>) => {
        updateFormData({
            contactInfo: { ...contactInfo, ...updates }
        });
    };

    return (
        <>
            <div>
                <h2 className="text-4xl font-bold mb-4">Project Coordination</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Share your contact details and timeline requirements so we can coordinate your project effectively.
                </p>
            </div>

            <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Full Name *</label>
                        <input
                            type="text"
                            value={contactInfo.name || ''}
                            onChange={(e) => updateContactInfo({ name: e.target.value })}
                            placeholder="Your full name"
                            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Email Address *</label>
                        <input
                            type="email"
                            value={contactInfo.email || ''}
                            onChange={(e) => updateContactInfo({ email: e.target.value })}
                            placeholder="your@email.com"
                            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">Phone Number</label>
                    <input
                        type="tel"
                        value={contactInfo.phone || ''}
                        onChange={(e) => updateContactInfo({ phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-4">Project Timeline</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TIMELINE_PREFERENCES.map((timeline) => (
                            <button
                                key={timeline.id}
                                onClick={() => updateFormData({ timelinePreference: timeline.id })}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${formData.timelinePreference === timeline.id
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <div className="font-semibold">{timeline.label}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{timeline.description}</div>
                            </button>
                        ))}
                    </div>
                    {errors.timelinePreference && <p className="text-red-500 text-sm mt-2">{errors.timelinePreference}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-4">Preferred Consultation Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'video', label: 'Video Call', description: 'Face-to-face discussion', icon: '📹' },
                            { id: 'phone', label: 'Phone Call', description: 'Voice consultation', icon: '📞' },
                            { id: 'in_person', label: 'In Person', description: 'Visit our studio', icon: '🏢' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => updateFormData({ consultationType: method.id })}
                                className={`p-4 rounded-lg border-2 text-center transition-all duration-300 ${formData.consultationType === method.id
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{method.icon}</div>
                                <div className="font-semibold">{method.label}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{method.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-4">Preferred Contact Method</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'email', label: 'Email', icon: Mail },
                            { id: 'phone', label: 'Phone', icon: Phone }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => updateFormData({ preferredContactMethod: method.id })}
                                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 ${formData.preferredContactMethod === method.id
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <method.icon className="w-5 h-5" />
                                {method.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Next Steps
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• We'll review your project requirements within 24 hours</li>
                        <li>• Schedule a consultation to discuss your vision in detail</li>
                        <li>• Create initial design concepts and provide detailed pricing</li>
                        <li>• Begin crafting your custom piece once design is approved</li>
                    </ul>
                </div>
            </div>
        </>
    );
}