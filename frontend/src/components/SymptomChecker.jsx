import React, { useState } from 'react';
import axios from 'axios';
import './styles/SymptomChecker.css';
import { symptoms } from '../data/symptoms';

const SymptomChecker = () => {
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);

    const handleSymptomSelect = (symptom) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptom)
                ? prev.filter((s) => s !== symptom)
                : [...prev, symptom]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedSymptoms.length === 0) {
            setError('Please select at least one symptom');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/recommend`,
                {
                    symptoms: selectedSymptoms,
                },
                { timeout: 30000 }
            );

            // Check for success flag
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to get recommendations');
            }

            // Access recommendations array from the response
            setRecommendations(response.data.recommendations);
        } catch (err) {
            const isTimeout = err.code === 'ECONNABORTED';
            setError(
                isTimeout
                    ? 'The server took too long to respond. It may be waking up from sleep — please try again in a moment.'
                    : err.response?.data?.error ||
                      err.response?.data?.message ||
                      err.message ||
                      'Failed to fetch recommendations. Please try again.'
            );
            console.error('Recommendation error:', err.response || err);
        } finally {
            setLoading(false);
        }
    };

    const renderArray = (arr, separator = ', ') => {
        if (!arr || !Array.isArray(arr)) return 'None';
        return arr.length > 0 ? arr.join(separator) : 'None';
    };

    const renderText = (text, defaultText = 'Not available') => {
        return text || defaultText;
    };

    const renderNumber = (num, defaultText = 'Not available') => {
        return num !== undefined && num !== null ? num : defaultText;
    };

    return (
        <div className="symptom-checker">
            <div className="symptom-selection">
                <h2>Select Your Symptoms</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {Object.entries(symptoms).map(([category, { title, symptoms: categorySymptoms }]) => (
                        <div key={category} className="symptom-category">
                            <h3>{title}</h3>
                            <div className="symptoms-grid">
                                {categorySymptoms.map((symptom) => (
                                    <div
                                        key={symptom}
                                        className={`symptom-chip ${
                                            selectedSymptoms.includes(symptom) ? 'selected' : ''
                                        }`}
                                        onClick={() => handleSymptomSelect(symptom)}
                                    >
                                        {symptom}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {selectedSymptoms.length > 0 && (
                        <div className="selected-symptoms">
                            <h3>Selected Symptoms:</h3>
                            <div className="selected-chips">
                                {selectedSymptoms.map((symptom) => (
                                    <div key={symptom} className="selected-chip">
                                        {symptom}
                                        <span
                                            className="remove-symptom"
                                            onClick={() => handleSymptomSelect(symptom)}
                                        >
                                            ×
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading || selectedSymptoms.length === 0}
                    >
                        {loading ? 'Finding Ayurvedic Remedies...' : 'Get Herbal Recommendations'}
                    </button>
                </form>
            </div>

            {recommendations.length > 0 && (
                <div className="recommendations-container">
                    <h2 className="recommendations-title">Your Ayurvedic Recommendations</h2>
                    <div className="recommendations-grid">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="recommendation-card">
                                <div className="recommendation-header">
                                    <h3>Recommendation {index + 1}</h3>
                                    <span className="match-score">
                                        {renderNumber(Math.round(rec?.confidence * 100), 'N/A')}% Match
                                    </span>
                                </div>
                                <div className="recommendation-body">
                                    <div className="herbs-section">
                                        <h4>Recommended Herbs</h4>
                                        <ul className="herbs-list">
                                            {rec?.herbs?.map((remedy, idx) => (
                                                <li key={idx}>{renderText(remedy)}</li>
                                            )) || <li>No herbs available</li>}
                                        </ul>
                                    </div>
                                    <div className="details-section">
                                        <div className="detail-item">
                                            <h4>Original Symptoms</h4>
                                            <p>{renderArray(rec?.symptoms)}</p>
                                        </div>
                                        <div className="detail-item">
                                            <h4>Ingredients</h4>
                                            <p>{renderText(rec?.ingredients)}</p>
                                        </div>
                                        <div className="detail-item">
                                            <h4>Instructions</h4>
                                            <p>{renderText(rec?.instructions)}</p>
                                        </div>
                                        <div className="detail-item">
                                            <h4>Recipe</h4>
                                            <p>{renderText(rec?.recipe)}</p>
                                        </div>
                                        <div className="detail-item">
                                            <h4>Dosage</h4>
                                            <p>{renderText(rec?.dosage)}</p>
                                        </div>
                                        <div className="extra-details">
                                            <div className="detail-item">
                                                <h4>Effectiveness Rating</h4>
                                                <p>{renderNumber(rec?.effectiveness_rating)}/5</p>
                                            </div>
                                            <div className="detail-item">
                                                <h4>Suitable Seasons</h4>
                                                <p>{renderArray(rec?.season_suitable)}</p>
                                            </div>
                                            <div className="detail-item">
                                                <h4>Severity Level</h4>
                                                <p>{renderText(rec?.severity_level)}</p>
                                            </div>
                                            <div className="detail-item">
                                                <h4>Recommended For</h4>
                                                <p>{renderArray(rec?.demographics)}</p>
                                            </div>
                                            <div className="detail-item">
                                                <h4>Contraindications</h4>
                                                <p>{renderArray(rec?.contraindications)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {loading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Finding the best herbal recommendations for you...</p>
                </div>
            )}
        </div>
    );
};

export default SymptomChecker;