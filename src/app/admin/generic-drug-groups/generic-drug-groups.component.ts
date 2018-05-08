import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GenericDrugGroupsService } from '../generic-drug-groups.service';
import { AlertService } from '../alert.service';
@Component({
  selector: 'app-generic-drug-groups',
  templateUrl: './generic-drug-groups.component.html',
  styleUrls: ['./generic-drug-groups.component.css']
})
export class GenericDrugGroupsComponent implements OnInit {

  groups: any = [];
  groupId: string;
  groupName: string;
  groupCode: string;

  opened = false;
  isUpdate = false;
  loading = false;

  constructor(
    private drugGroupService: GenericDrugGroupsService,
    private ref: ChangeDetectorRef,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.getList();
  }

  addNew() {
    this.groupId = null;
    this.groupCode = null;
    this.groupName = null;
    this.isUpdate = false;
    this.opened = true;
  }

  getList() {
    this.loading = true;
    this.drugGroupService.all()
      .then((results: any) => {
        if (results.ok) {
          this.groups = results.rows;
          this.ref.detectChanges();
          this.loading = false;
        } else {
          this.alertService.error(JSON.stringify(results.error));
        }
      })
      .catch(() => {
        this.alertService.serverError();
      });
  }

  edit(p: any) {
    this.groupId = p.group_id;
    this.groupName = p.group_name;
    this.groupCode = p.group_code;
    this.isUpdate = true;
    this.opened = true;
  }

  remove(p: any) {
    this.alertService.confirm('ต้องการลบ ใช่หรือไม่? [' + p.group_name + ']')
      .then(() => {
        this.drugGroupService.remove(p.group_id)
          .then((results: any) => {
            if (results.ok) {
              this.alertService.success();
              this.getList();
            } else {
              this.alertService.error(JSON.stringify(results.error));
            }
          })
          .catch(() => {
            this.alertService.serverError();
          });
      });
  }

  async save() {
    try {
      if (this.groupName) {
        let results;
        if (this.isUpdate) {
          results = await this.drugGroupService.update(this.groupId, this.groupName, this.groupCode);
          if (this.groupCode == null || this.groupCode === '') {
            await this.drugGroupService.update(this.groupId, this.groupName, this.groupId);
          }
        } else {
          results = await this.drugGroupService.save(this.groupName, this.groupCode);
          if ((this.groupCode == null || this.groupCode === '') && results.ok) {
            await this.drugGroupService.update(results.rows[0], this.groupName, results.rows[0]);
          }
        }

        // promise.then((results: any) => {
        if (results.ok) {
          this.alertService.success();
          this.opened = false;
          this.getList();
        } else {
          this.alertService.error('ข้อมูลซ้ำ');
          console.log(results.error);
        }
      }
    } catch (error) {
      this.alertService.error(error);
    }
  }
}
