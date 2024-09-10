const Database = require('../../database/newclient');

class DescriptionBuilder {
  async buildDescription(filters) {
    let description = '';

    // Start building the description
    description += await this.addAlcoholDescriptionIfExist(filters['alcohol-volume']);

    if (filters['taste']?.length > 0) {
      description += ', ';
    } else {
      description += ' ';
    }

    description += await this.addTasteDescriptionIfExist(filters['taste']);
    description += 'коктейлі'; // COCKTAIL_NAME

    description += await this.addTagsDescriptionIfExist(filters['tags']);
    description += await this.addGoodsDescriptionIfExist(filters['goods']);
    description += await this.addGlasswareDescriptionIfExist(filters['glassware']);

    // trim string remove command and spaces at start and end of string
    description = description.trim().replace(/(^\s*,)|(,\s*$)/g, '').replace(/^./, char => char.toUpperCase()).trim();

    description = description.trim().length > 0 && description.trim() !== 'коктейлі' ? description.trim() : null;
    return description;
  }

  async addGlasswareDescriptionIfExist(glasswareSlugs) {
    if (glasswareSlugs?.length > 0) {
      const glasswareSlug = glasswareSlugs[0];
      const glassware = await Database.collection('glassware').findOne({ slug: glasswareSlug });
      if (glassware) {
        return ` в ${this.capitalize(glassware.name)}`;
      }
    }
    return '';
  }

  async addGoodsDescriptionIfExist(goodSlugs) {
    if (goodSlugs?.length > 0) {
      const goods = await Database.collection('goods').find({ slug: { $in: goodSlugs } }).toArray();
      if (goods.length > 0) {
        return ` з ${goods.map(g => this.capitalize(g.name)).join(', ')}`;
      }
    }
    return '';
  }

  async addTagsDescriptionIfExist(tagsSlugs) {
    if (tagsSlugs?.length > 0) {
      const tags = await Database.collection('tags').find({ slug: { $in: tagsSlugs } }).sort({ slug: 1 }).toArray();
      if (tags.length > 0) {
        return ` ${tags.map(t => this.capitalize(t.name)).join(', ')}`;
      }
    }
    return '';
  }

  async addTasteDescriptionIfExist(tasteSlugs) {
    if (tasteSlugs?.length > 0) {
      const tastes = await Database.collection('tastes').find({ slug: { $in: tasteSlugs } }).toArray();
      if (tastes.length > 0) {
        return `${tastes.map(t => this.capitalize(t.name)).join(', ')} `;
      }
    }
    return '';
  }

  async addAlcoholDescriptionIfExist(alcoholSlugs) {
    if (alcoholSlugs?.length > 0) {
      const alcoholSlug = alcoholSlugs[0];
      const alcoholVolume = await Database.collection('alcoholVolumes').findOne({ slug: alcoholSlug });
      if (alcoholVolume) {
        return this.capitalize(alcoholVolume.name);
      }
    }
    return '';
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

module.exports = DescriptionBuilder;

