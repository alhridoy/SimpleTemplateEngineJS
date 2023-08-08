const fs = require('fs');

class SimpleTemplateEngine {
    constructor() {
        this.templates = {};
    }

    loadTemplate(name, template) {
        this.templates[name] = template;
    }

    render(templateName, context = {}) {
        let template = this.templates[templateName];
        
        // Print values
        template = template.replace(/{{\s*(\w+)\s*}}/g, (_, varName) => {
            return context[varName] || '';
        });
        
        // Comments
        template = template.replace(/{#\s*(.*?)\s*#}/g, '<!--$1-->');

        // If conditions
        template = template.replace(/{% if (.*?) %}(.*?){% endif %}/gs, (_, condition, content) => {
            let fn = new Function(...Object.keys(context), `return ${condition};`);
            return fn(...Object.values(context)) ? content : '';
        });

        // For loops (simple, for arrays)
        template = template.replace(/{% for (\w+) in (\w+) %}(.*?){% endfor %}/gs, (_, itemVar, arrVar, loopContent) => {
            let arr = context[arrVar] || [];
            return arr.map(item => {
                let loopCtx = { ...context, [itemVar]: item };
                return this.renderInline(loopContent, loopCtx);
            }).join('');
        });

        // Includes
        template = template.replace(/{% include "(.*?)" %}/g, (_, incTemplate) => {
            return this.render(incTemplate, context);
        });

        return template;
    }

    renderInline(template, context) {
        // A simplified render for inner loops, only supporting variable printing for this demo
        return template.replace(/{{\s*(\w+)\s*}}/g, (_, varName) => {
            return context[varName] || '';
        });
    }
}

// Usage example
const engine = new SimpleTemplateEngine();

//when we will run the following conetent will be shown

engine.loadTemplate('main', `
    {{ message }}
    {# This is a comment #}
    {% if showContent %}
        Showing content!
    {% endif %}
    {% for item in items %}
        Item: {{ item }}
    {% endfor %}
    {% include "subView" %}
`);

engine.loadTemplate('subView', `
    This is a sub-view!
`);

const rendered = engine.render('main', {
    message: 'Hello, World!',
    showContent: true,
    items: ['a', 'b', 'c']
});

console.log(rendered);
