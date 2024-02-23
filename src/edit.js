import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { SelectControl, PanelBody, FormTokenField } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const { postType, taxonomy, terms = [] } = attributes;

    // Fetch post types
    const postTypes = useSelect((select) => select('core').getPostTypes({ per_page: -1 }), []) || [];

    // Fetch taxonomies for the selected post type
    const taxonomies = useSelect((select) => {
        if (!postType) return [];
        const _taxonomies = select('core').getTaxonomies({ per_page: -1 });
        return _taxonomies?.filter(tax => tax.types.includes(postType));
    }, [postType]) || [];

    // Fetch terms for the selected taxonomy
    const termData = useSelect((select) => {
        if (!taxonomy) return [];
        return select('core').getEntityRecords('taxonomy', taxonomy, { per_page: 50 });
    }, [taxonomy]) || [];

    // Prepare terms for the FormTokenField component
    const termSuggestions = termData.map(term => term.name);

    const onPostTypeChange = (newPostType) => {
        setAttributes({ postType: newPostType, taxonomy: '', terms: [] }); // Reset taxonomy and terms when post type changes
    };

    const onTaxonomyChange = (newTaxonomy) => {
        setAttributes({ taxonomy: newTaxonomy, terms: [] }); // Reset terms when taxonomy changes
    };

    const onTermsChange = (newTerms) => {
        // Map term names back to term IDs to store in attributes
        const termIds = newTerms.map(termName => {
            const term = termData.find(t => t.name === termName);
            return term ? term.id : null;
        }).filter(id => id != null);

        setAttributes({ terms: termIds });
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__("Post Type and Taxonomy Settings", "advanced-posts")}>
                    <SelectControl
                        label={__("Select Post Type", "advanced-posts")}
                        value={postType}
                        options={[
                            { label: 'Select a post type', value: '' },
                            ...postTypes.map(({ slug, labels }) => ({
                                label: labels.singular_name,
                                value: slug,
                            })),
                        ]}
                        onChange={onPostTypeChange}
                    />
                    <SelectControl
                        label={__("Select Taxonomy", "advanced-posts")}
                        value={taxonomy}
                        options={[
                            { label: 'Select a taxonomy', value: '' },
                            ...taxonomies.map(({ slug, labels }) => ({
                                label: labels.singular_name,
                                value: slug,
                            })),
                        ]}
                        onChange={onTaxonomyChange}
                        disabled={!postType}
                    />
                    {taxonomy && (
                        <FormTokenField
                            label={__("Select Terms", "advanced-posts")}
                            value={terms.map(termId => {
                                const term = termData.find(t => t.id === termId);
                                return term ? term.name : '';
                            }).filter(name => name !== '')}
                            suggestions={termSuggestions}
                            onChange={onTermsChange}
                            maxSuggestions={20}
                        />
                    )}
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps()}>
                <InnerBlocks />
            </div>
        </>
    );
}
